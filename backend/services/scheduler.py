from datetime import date, timedelta
from typing import List, Optional
from models import Topic, DaySchedule, StudyPlan
import math

from services.store import JSONStore

class SchedulerService:
    def __init__(self):
        self.store = JSONStore()

    def create_plan(self, topics: List[Topic], exam_date: date, parallel_courses: int, name: str = "My Study Plan") -> StudyPlan:
        today = date.today()
        # ... (rest of logic unchanged until return) ...
        days_remaining = (exam_date - today).days
        
        if days_remaining <= 0:
            raise ValueError("Exam date must be in the future.")

        # Calculate Total Load
        total_hours_needed = sum(t.estimated_hours for t in topics)
        
        # Adaptive Pacing Calculation
        daily_target_hours = 0.0
        if days_remaining > 0:
            daily_target_hours = total_hours_needed / days_remaining
            
        schedule: List[DaySchedule] = []
        current_date_idx = 0
        topic_idx = 0
        
        while current_date_idx < days_remaining and topic_idx < len(topics):
            current_date = today + timedelta(days=current_date_idx)
            current_day_topics = []
            current_day_hours = 0.0
            
            while topic_idx < len(topics):
                topic = topics[topic_idx]
                
                if current_day_hours == 0:
                    current_day_topics.append(topic)
                    current_day_hours += topic.estimated_hours
                    topic_idx += 1
                elif (current_day_hours + topic.estimated_hours) <= (daily_target_hours * 1.2):
                     current_day_topics.append(topic)
                     current_day_hours += topic.estimated_hours
                     topic_idx += 1
                else:
                    break
            
            schedule.append(DaySchedule(
                date=current_date,
                topics=current_day_topics,
                total_hours=round(current_day_hours, 1)
            ))
            current_date_idx += 1
            
        # If we ran out of days but still have topics (Cramming)
        if topic_idx < len(topics):
            last_day = schedule[-1]
            while topic_idx < len(topics):
                topic = topics[topic_idx]
                last_day.topics.append(topic)
                last_day.total_hours += topic.estimated_hours
                topic_idx += 1
            last_day.total_hours = round(last_day.total_hours, 1)

        plan = StudyPlan(
            id=f"plan_{today.isoformat()}_{len(topics)}",
            name=name,
            exam_date=exam_date,
            parallel_courses=parallel_courses,
            schedule=schedule,
            created_at=today
        )
        
        # Save to store
        self.store.save_plan(plan)
        return plan

    def rename_plan(self, plan_id: str, new_name: str) -> Optional[StudyPlan]:
        plan = self.store.get_plan(plan_id)
        if not plan:
            return None
        
        plan.name = new_name
        self.store.save_plan(plan)
        return plan
