from datetime import date, timedelta
from typing import List
from models import Topic, DaySchedule, StudyPlan
import math
import uuid

try:
    from .mongo_store import MongoStore
except ImportError:
    from services.mongo_store import MongoStore

class SchedulerService:
    def __init__(self):
        self.store = MongoStore()
        print("Using MongoStore (study_plans)")

    def create_plan(self, topics: List[Topic], exam_date: date, parallel_courses: int, 
                    user_id: str, title: str = "My Learning Journey", study_days: List[int] = [0,1,2,3,4,5,6], daily_goal: float = 2.0) -> StudyPlan:
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
             # Fallback
             available_dates = [today + timedelta(days=d) for d in range(days_remaining + 1)]

        # 2. Calculate Pacing
        total_topics_hours = sum(t.estimated_hours for t in topics)
        calculated_daily_pace = total_topics_hours / max(1, len(available_dates))
        
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
                if current_day_hours == 0:
                     current_day_topics.append(topic)
                     current_day_hours += topic.estimated_hours
                     topic_idx += 1
                elif (current_day_hours + topic.estimated_hours) <= (target_pace * 1.35): # 35% tolerance
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
                 pass

        plan = StudyPlan(
            id=str(uuid.uuid4()),
            user_id=user_id,
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
