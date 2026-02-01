from datetime import date, timedelta
from typing import List
from models import Topic, DaySchedule, StudyPlan
import math

from services.store import JSONStore

class SchedulerService:
    def __init__(self):
        self.store = JSONStore()

    def create_plan(self, topics: List[Topic], exam_date: date, parallel_courses: int) -> StudyPlan:
        today = date.today()
        # ... (rest of logic unchanged until return) ...
        days_remaining = (exam_date - today).days
        
        if days_remaining <= 0:
            raise ValueError("Exam date must be in the future.")

        # Calculate Total Load
        total_hours_needed = sum(t.estimated_hours for t in topics)
        
        # Adaptive Pacing Calculation
        # We want to spread the load evenly, but respect the parallel courses constraint
        # effectively determining if the "even spread" is feasible within the capacity 
        # normally left by parallel courses.
        
        daily_target_hours = 0.0
        if days_remaining > 0:
            daily_target_hours = total_hours_needed / days_remaining
            
        # Check against capacity constraint (soft check)
        # Base capacity ~6h. 2 courses -> 2h available.
        # If we need 3h/day but only have 2h available, we warn (or just schedule long days).
        # For this implementation, we prioritize the EXAM DATE. So we schedule what is needed
        # even if it exceeds the "comfortable" capacity derived from parallel courses.
        # But we can flag days as "Overload".
        
        schedule: List[DaySchedule] = []
        current_date_idx = 0
        topic_idx = 0
        
        while current_date_idx < days_remaining and topic_idx < len(topics):
            current_date = today + timedelta(days=current_date_idx)
            current_day_topics = []
            current_day_hours = 0.0
            
            # Fill the day until we hit the daily target
            # Loop while we haven't met target OR (we haven't added anything yet AND we still have topics)
            # This ensures at least one topic per day if there are many small days, 
            # or fills up to target.
            while topic_idx < len(topics):
                topic = topics[topic_idx]
                
                # If adding this topic keeps us relatively close to target, or if the day is empty:
                # Condition: Empty Day OR (Current + New <= Target * 1.2 tolerance)
                # But if the topic itself is huge (bigger than target), we must add it alone.
                
                if current_day_hours == 0:
                    current_day_topics.append(topic)
                    current_day_hours += topic.estimated_hours
                    topic_idx += 1
                elif (current_day_hours + topic.estimated_hours) <= (daily_target_hours * 1.2):
                     current_day_topics.append(topic)
                     current_day_hours += topic.estimated_hours
                     topic_idx += 1
                else:
                    # Day is full enough
                    break
            
            schedule.append(DaySchedule(
                date=current_date,
                topics=current_day_topics,
                total_hours=round(current_day_hours, 1)
            ))
            current_date_idx += 1
            
        # If we ran out of days but still have topics (Cramming)
        if topic_idx < len(topics):
            # Add remaining topics to the last day (Panic Mode)
            last_day = schedule[-1]
            while topic_idx < len(topics):
                topic = topics[topic_idx]
                last_day.topics.append(topic)
                last_day.total_hours += topic.estimated_hours
                topic_idx += 1
            last_day.total_hours = round(last_day.total_hours, 1)

        plan = StudyPlan(
            id=f"plan_{today.isoformat()}_{len(topics)}",
            exam_date=exam_date,
            parallel_courses=parallel_courses,
            schedule=schedule,
            created_at=today
        )
        
        # Save to store
        self.store.save_plan(plan)
        return plan
