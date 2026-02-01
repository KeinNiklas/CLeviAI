from datetime import date, timedelta
from typing import List
from models import Topic, DaySchedule, StudyPlan
import math

class SchedulerService:
    def create_plan(self, topics: List[Topic], exam_date: date, parallel_courses: int) -> StudyPlan:
        today = date.today()
        days_remaining = (exam_date - today).days
        
        if days_remaining <= 0:
            raise ValueError("Exam date must be in the future.")

        # Heuristic: Parallel courses reduce available capacity for THIS course
        # Base capacity per day (e.g., 6 hours total study time)
        # If 0 parallel: 6h available.
        # If 2 parallel: 6 / (1 + 2) = 2h available per day.
        base_daily_capacity = 6.0
        effective_daily_capacity = base_daily_capacity / (1 + parallel_courses)
        
        schedule: List[DaySchedule] = []
        current_date_idx = 0
        current_day_topics = []
        current_day_hours = 0.0
        
        # Simple greedy allocation
        for topic in topics:
            remaining_topic_hours = topic.estimated_hours
            
            while remaining_topic_hours > 0:
                if current_date_idx >= days_remaining:
                    # Cram remaining into last day or overflow
                    current_date_idx = days_remaining - 1
                
                space_in_day = max(0, effective_daily_capacity - current_day_hours)
                
                if space_in_day < 0.5 and current_day_hours > 0:
                    # Move to next day if day is largely full
                    schedule.append(DaySchedule(
                        date=today + timedelta(days=len(schedule)),
                        topics=current_day_topics,
                        total_hours=round(current_day_hours, 1)
                    ))
                    current_day_topics = []
                    current_day_hours = 0.0
                    current_date_idx += 1
                    continue

                # Allocate what fits or all of it
                hours_to_allocate = min(remaining_topic_hours, space_in_day)
                # If space is tiny but we have a small remainder, just finish it (soft cap)
                if hours_to_allocate < remaining_topic_hours and (remaining_topic_hours - hours_to_allocate) < 0.5:
                    hours_to_allocate = remaining_topic_hours

                # Update current day
                # We clone the topic to handle split (simplification: just listing it)
                # Ideally we'd say "Topic X (Part 1)" but for now just list the topic
                current_day_topics.append(topic)
                current_day_hours += hours_to_allocate
                remaining_topic_hours -= hours_to_allocate
                
                # Check if day is full
                if current_day_hours >= effective_daily_capacity:
                    schedule.append(DaySchedule(
                        date=today + timedelta(days=len(schedule)),
                        topics=current_day_topics,
                        total_hours=round(current_day_hours, 1)
                    ))
                    current_day_topics = []
                    current_day_hours = 0.0
                    current_date_idx += 1
        
        # Append last day if not empty
        if current_day_topics:
            schedule.append(DaySchedule(
                date=today + timedelta(days=len(schedule)),
                topics=current_day_topics,
                total_hours=round(current_day_hours, 1)
            ))

        return StudyPlan(
            id=f"plan_{today.isoformat()}",
            exam_date=exam_date,
            parallel_courses=parallel_courses,
            schedule=schedule,
            created_at=today
        )
