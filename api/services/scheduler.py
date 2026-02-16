from datetime import date, timedelta
from typing import List
from models import Topic, DaySchedule, StudyPlan
import math

from services.store import JSONStore

class SchedulerService:
    def __init__(self):
        self.store = JSONStore()

    def create_plan(self, topics: List[Topic], exam_date: date, parallel_courses: int, 
                    title: str = "My Learning Journey", study_days: List[int] = [0,1,2,3,4,5,6], daily_goal: float = 2.0) -> StudyPlan:
        today = date.today()
        
        days_remaining = (exam_date - today).days
        if days_remaining <= 0:
            raise ValueError("Exam date must be in the future.")

        # 1. Calculate Available Study Days (Capacity)
        available_dates = []
        for d in range(days_remaining + 1): 
            day_date = today + timedelta(days=d)
            if day_date.weekday() in study_days:
                available_dates.append(day_date)
        
        if not available_dates:
             # Fallback if no days match (e.g. only Sunday selected but exam is Friday)
             # Force add weekends or everything to avoid failure? 
             # For now, let's just use all dates if filter results in 0
             available_dates = [today + timedelta(days=d) for d in range(days_remaining + 1)]

        # 2. Calculate Pacing
        total_topics_hours = sum(t.estimated_hours for t in topics)
        # Even spread: total hours / number of available days
        calculated_daily_pace = total_topics_hours / max(1, len(available_dates))
        
        # Use the *larger* of (calculated pace vs user goal) IF we want to force them to work harder?
        # NO, we must ensure completion. So calculated_daily_pace is the MINIMUM requirement.
        # If user Goal is HIGHER, we can front-load (finish early).
        # Let's target the "calculated_daily_pace" to ensures smoothness.
        
        target_pace = calculated_daily_pace

        # 3. Distribute Topics
        schedule: List[DaySchedule] = []
        topic_idx = 0
        
        for current_date in available_dates:
            if topic_idx >= len(topics):
                break # Done!

            current_day_topics = []
            current_day_hours = 0.0
            
            while topic_idx < len(topics):
                topic = topics[topic_idx]
                
                # Check fit
                # IF day is empty -> Add it
                # IF (current + next) <= target * 1.3 (tolerance) -> Add it
                if current_day_hours == 0:
                     current_day_topics.append(topic)
                     current_day_hours += topic.estimated_hours
                     topic_idx += 1
                elif (current_day_hours + topic.estimated_hours) <= (target_pace * 1.35): # 35% tolerance for chunkiness
                     current_day_topics.append(topic)
                     current_day_hours += topic.estimated_hours
                     topic_idx += 1
                else:
                    break # Day full
            
            schedule.append(DaySchedule(
                date=current_date,
                topics=current_day_topics,
                total_hours=round(current_day_hours, 1)
            ))
            
        # 4. Handle Leftovers (Panic Mode)
        # If topics remain after running through all available dates
        if topic_idx < len(topics):
            # Add to the very last scheduled day (Cramming)
            if schedule:
                last_day = schedule[-1]
                while topic_idx < len(topics):
                    topic = topics[topic_idx]
                    last_day.topics.append(topic)
                    last_day.total_hours += topic.estimated_hours
                    topic_idx += 1
                last_day.total_hours = round(last_day.total_hours, 1)
            else:
                 # Should not happen if available_dates > 0
                 pass

        plan = StudyPlan(
            id=f"plan_{today.isoformat()}_{len(topics)}",
            title=title,
            exam_date=exam_date,
            parallel_courses=parallel_courses,
            study_days=study_days,
            daily_goal_hours=daily_goal,
            schedule=schedule,
            created_at=today
        )
        
        # Save to store
        self.store.save_plan(plan)
        return plan
