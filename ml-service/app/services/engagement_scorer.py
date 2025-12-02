"""
Engagement Scoring Service
Uses activity analysis and sentiment to calculate user engagement
"""
from typing import List, Dict, Any
import numpy as np
from datetime import datetime, timedelta
from collections import Counter

class EngagementScorer:
    def __init__(self):
        self.weights = {
            'activity_frequency': 0.30,
            'interaction_quality': 0.25,
            'response_time': 0.20,
            'content_contribution': 0.25
        }
    
    def calculate(
        self,
        user_id: int,
        activity_logs: List[Dict[str, Any]],
        messages: List[Dict[str, Any]],
        posts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive engagement score (0-100).
        """
        
        # 1. Activity Frequency Score
        activity_score = self._calculate_activity_frequency(activity_logs)
        
        # 2. Interaction Quality Score (based on messages and posts)
        interaction_score = self._calculate_interaction_quality(messages, posts)
        
        # 3. Response Time Score
        response_score = self._calculate_response_time(messages)
        
        # 4. Content Contribution Score
        content_score = self._calculate_content_contribution(posts)
        
        # Weighted combination
        engagement_score = (
            activity_score * self.weights['activity_frequency'] +
            interaction_score * self.weights['interaction_quality'] +
            response_score * self.weights['response_time'] +
            content_score * self.weights['content_contribution']
        )
        
        breakdown = {
            'activity_frequency': round(activity_score, 2),
            'interaction_quality': round(interaction_score, 2),
            'response_time': round(response_score, 2),
            'content_contribution': round(content_score, 2)
        }
        
        # Generate insights
        insights = self._generate_insights(
            engagement_score,
            activity_score,
            interaction_score,
            response_score,
            content_score
        )
        
        # Determine trend
        trend = self._calculate_trend(activity_logs)
        
        return {
            'engagement_score': round(engagement_score, 2),
            'breakdown': breakdown,
            'insights': insights,
            'trend': trend
        }
    
    def _calculate_activity_frequency(self, activity_logs: List[Dict[str, Any]]) -> float:
        """Calculate score based on activity frequency"""
        if not activity_logs:
            return 0.0
        
        # Count activities in last 30 days
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        
        recent_activities = [
            log for log in activity_logs
            if datetime.fromisoformat(log.get('timestamp', now.isoformat())) > thirty_days_ago
        ]
        
        count = len(recent_activities)
        
        # Score based on activity count (0-100)
        if count >= 50:
            return 100.0
        elif count >= 30:
            return 80.0 + (count - 30) * (20.0 / 20.0)
        elif count >= 15:
            return 60.0 + (count - 15) * (20.0 / 15.0)
        elif count >= 5:
            return 40.0 + (count - 5) * (20.0 / 10.0)
        else:
            return count * 8.0  # 0-40 for 0-5 activities
    
    def _calculate_interaction_quality(
        self,
        messages: List[Dict[str, Any]],
        posts: List[Dict[str, Any]]
    ) -> float:
        """Calculate score based on quality of interactions"""
        total_score = 0.0
        
        # Message quality (length, frequency)
        if messages:
            avg_message_length = np.mean([len(m.get('content', '')) for m in messages])
            message_count = len(messages)
            
            length_score = min(avg_message_length / 100, 1.0) * 50  # Max 50 points
            count_score = min(message_count / 20, 1.0) * 50  # Max 50 points
            total_score += (length_score + count_score) / 2
        
        # Post quality (engagement, content)
        if posts:
            avg_reactions = np.mean([p.get('reactions_count', 0) for p in posts])
            post_count = len(posts)
            
            reaction_score = min(avg_reactions / 10, 1.0) * 50
            post_score = min(post_count / 10, 1.0) * 50
            total_score += (reaction_score + post_score) / 2
        
        # If both exist, average them; otherwise use what's available
        if messages and posts:
            return total_score / 2
        elif messages or posts:
            return total_score
        else:
            return 0.0
    
    def _calculate_response_time(self, messages: List[Dict[str, Any]]) -> float:
        """Calculate score based on response time"""
        if len(messages) < 2:
            return 50.0  # Neutral score if insufficient data
        
        # Calculate average time between messages (simulated)
        # In real implementation, would analyze actual response times
        response_times = []
        for i in range(1, len(messages)):
            prev_time = datetime.fromisoformat(messages[i-1].get('created_at', datetime.now().isoformat()))
            curr_time = datetime.fromisoformat(messages[i].get('created_at', datetime.now().isoformat()))
            time_diff = (curr_time - prev_time).total_seconds() / 3600  # hours
            response_times.append(time_diff)
        
        if not response_times:
            return 50.0
        
        avg_response_time = np.mean(response_times)
        
        # Score based on response time (faster = better)
        if avg_response_time <= 1:  # < 1 hour
            return 100.0
        elif avg_response_time <= 4:  # < 4 hours
            return 80.0
        elif avg_response_time <= 12:  # < 12 hours
            return 60.0
        elif avg_response_time <= 24:  # < 1 day
            return 40.0
        else:
            return 20.0
    
    def _calculate_content_contribution(self, posts: List[Dict[str, Any]]) -> float:
        """Calculate score based on content creation"""
        if not posts:
            return 0.0
        
        # Count posts in last 30 days
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        
        recent_posts = [
            post for post in posts
            if datetime.fromisoformat(post.get('created_at', now.isoformat())) > thirty_days_ago
        ]
        
        post_count = len(recent_posts)
        
        # Score based on post count and quality
        count_score = min(post_count / 10, 1.0) * 70  # Max 70 for quantity
        
        # Quality: posts with images/tags score higher
        quality_bonus = 0
        for post in recent_posts[:10]:  # Check up to 10 recent posts
            if post.get('image_urls') or post.get('images'):
                quality_bonus += 1.5
            if post.get('tags') and len(post.get('tags', [])) > 0:
                quality_bonus += 1.5
        
        quality_score = min(quality_bonus, 30.0)  # Max 30 for quality
        
        return count_score + quality_score
    
    def _generate_insights(
        self,
        overall: float,
        activity: float,
        interaction: float,
        response: float,
        content: float
    ) -> List[str]:
        """Generate actionable insights"""
        insights = []
        
        if overall >= 80:
            insights.append("Highly engaged user! Excellent participation.")
        elif overall >= 60:
            insights.append("Good engagement level. Keep up the great work!")
        elif overall >= 40:
            insights.append("Moderate engagement. Consider increasing activity.")
        else:
            insights.append("Low engagement detected. Recommendations provided below.")
        
        # Specific recommendations
        if activity < 50:
            insights.append("Tip: Increase daily platform visits to boost engagement.")
        
        if interaction < 50:
            insights.append("Tip: Engage more with posts and messages from peers.")
        
        if response < 50:
            insights.append("Tip: Try to respond to messages more promptly.")
        
        if content < 50:
            insights.append("Tip: Share your knowledge by creating posts and discussions.")
        
        # Positive reinforcement for strong areas
        if activity >= 80:
            insights.append("Strong activity frequency! You're very active.")
        
        if interaction >= 80:
            insights.append("Excellent interaction quality! Your contributions are valuable.")
        
        return insights
    
    def _calculate_trend(self, activity_logs: List[Dict[str, Any]]) -> str:
        """Determine engagement trend (increasing, decreasing, stable)"""
        if len(activity_logs) < 10:
            return "stable"
        
        # Compare last 7 days vs previous 7 days
        now = datetime.now()
        seven_days_ago = now - timedelta(days=7)
        fourteen_days_ago = now - timedelta(days=14)
        
        recent_count = len([
            log for log in activity_logs
            if seven_days_ago < datetime.fromisoformat(log.get('timestamp', now.isoformat())) <= now
        ])
        
        previous_count = len([
            log for log in activity_logs
            if fourteen_days_ago < datetime.fromisoformat(log.get('timestamp', now.isoformat())) <= seven_days_ago
        ])
        
        if previous_count == 0:
            return "stable"
        
        change_ratio = (recent_count - previous_count) / previous_count
        
        if change_ratio > 0.2:
            return "increasing"
        elif change_ratio < -0.2:
            return "decreasing"
        else:
            return "stable"
