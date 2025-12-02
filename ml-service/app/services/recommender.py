"""
Alumni Recommendation Service
Uses k-NN with combined similarity features
"""
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
import numpy as np
from .profile_matcher import ProfileMatcher

class AlumniRecommender:
    def __init__(self):
        self.profile_matcher = ProfileMatcher()
        self.scaler = StandardScaler()
    
    def recommend(
        self,
        student_profile: Dict[str, Any],
        alumni_profiles: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Recommend top N alumni for a student using similarity scoring.
        Returns ranked list with match percentages and explanations.
        """
        if not alumni_profiles:
            return []
        
        # Calculate match scores for all alumni
        recommendations = []
        
        for alumni in alumni_profiles:
            try:
                match_result = self.profile_matcher.match(student_profile, alumni)
                
                recommendations.append({
                    'alumni_id': alumni.get('id'),
                    'match_percent': match_result['match_percent'],
                    'breakdown': match_result['breakdown'],
                    'explanation': match_result['explanation'],
                    'alumni_name': alumni.get('name', 'Unknown'),
                    'alumni_headline': alumni.get('headline', ''),
                    'alumni_company': alumni.get('company', ''),
                })
            except Exception as e:
                # Skip alumni that cause errors
                continue
        
        # Sort by match percentage (descending)
        recommendations.sort(key=lambda x: x['match_percent'], reverse=True)
        
        # Return top N
        return recommendations[:limit]
    
    def recommend_with_knn(
        self,
        student_profile: Dict[str, Any],
        alumni_profiles: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Alternative recommendation using k-NN with feature vectors.
        More sophisticated approach using distance-based similarity.
        """
        if len(alumni_profiles) < limit:
            # Fall back to simple matching
            return self.recommend(student_profile, alumni_profiles, limit)
        
        # Extract features for all alumni
        alumni_features = []
        alumni_ids = []
        
        for alumni in alumni_profiles:
            features = self._extract_features(alumni)
            if features is not None:
                alumni_features.append(features)
                alumni_ids.append(alumni.get('id'))
        
        if len(alumni_features) < limit:
            return self.recommend(student_profile, alumni_profiles, limit)
        
        # Convert to numpy array
        X = np.array(alumni_features)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Extract student features
        student_features = self._extract_features(student_profile)
        if student_features is None:
            return self.recommend(student_profile, alumni_profiles, limit)
        
        student_features_scaled = self.scaler.transform([student_features])
        
        # Fit k-NN
        knn = NearestNeighbors(n_neighbors=min(limit, len(alumni_features)), metric='euclidean')
        knn.fit(X_scaled)
        
        # Find nearest neighbors
        distances, indices = knn.kneighbors(student_features_scaled)
        
        # Build recommendations
        recommendations = []
        for dist, idx in zip(distances[0], indices[0]):
            alumni_id = alumni_ids[idx]
            alumni = next((a for a in alumni_profiles if a.get('id') == alumni_id), None)
            
            if alumni:
                # Convert distance to similarity score (0-100)
                similarity_score = max(0, 100 - (dist * 20))
                
                match_result = self.profile_matcher.match(student_profile, alumni)
                
                recommendations.append({
                    'alumni_id': alumni_id,
                    'match_percent': round(similarity_score, 2),
                    'breakdown': match_result['breakdown'],
                    'explanation': f"k-NN similarity: {similarity_score:.0f}%. " + match_result['explanation'],
                    'alumni_name': alumni.get('name', 'Unknown'),
                    'alumni_headline': alumni.get('headline', ''),
                    'knn_distance': round(float(dist), 4)
                })
        
        return recommendations
    
    def _extract_features(self, profile: Dict[str, Any]) -> List[float]:
        """
        Extract numerical features from profile for k-NN.
        Returns feature vector or None if insufficient data.
        """
        features = []
        
        # Skill count
        skills = profile.get('skills', [])
        features.append(len(skills) if skills else 0)
        
        # Years of experience
        features.append(profile.get('years_of_experience', 0))
        
        # Text length features
        bio = profile.get('bio', '')
        headline = profile.get('headline', '')
        features.append(len(bio))
        features.append(len(headline))
        
        # Boolean features (0 or 1)
        features.append(1 if profile.get('linkedin_url') else 0)
        features.append(1 if profile.get('github_url') else 0)
        features.append(1 if profile.get('resume_url') else 0)
        
        # Branch encoding (simplified - could use one-hot encoding)
        branch_map = {
            'Computer Engineering': 1,
            'Information Technology': 2,
            'Electronics': 3,
            'Mechanical': 4,
            'Civil': 5
        }
        features.append(branch_map.get(profile.get('branch', ''), 0))
        
        return features if any(features) else None
    
    def explain_recommendation(
        self,
        student_profile: Dict[str, Any],
        alumni_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provide detailed explanation for why an alumni was recommended.
        """
        match_result = self.profile_matcher.match(student_profile, alumni_profile)
        
        # Additional explainability
        student_skills = set(student_profile.get('skills', []))
        alumni_skills = set(alumni_profile.get('skills', []))
        common_skills = list(student_skills & alumni_skills)
        
        unique_alumni_skills = list(alumni_skills - student_skills)
        
        explanation = {
            'match_score': match_result['match_percent'],
            'breakdown': match_result['breakdown'],
            'common_skills': common_skills,
            'skills_you_can_learn': unique_alumni_skills[:5],
            'same_branch': student_profile.get('branch') == alumni_profile.get('branch'),
            'alumni_experience_years': alumni_profile.get('years_of_experience', 0),
            'recommendation_reason': match_result['explanation'],
            'what_makes_good_match': self._generate_match_reasons(match_result['breakdown'])
        }
        
        return explanation
    
    def _generate_match_reasons(self, breakdown: Dict[str, float]) -> List[str]:
        """Generate list of reasons why this is a good match"""
        reasons = []
        
        if breakdown.get('skills_overlap', 0) >= 60:
            reasons.append("Strong skills overlap - can provide relevant guidance")
        
        if breakdown.get('branch_match', 0) >= 80:
            reasons.append("Same academic background - understands your coursework")
        
        if breakdown.get('experience_relevance', 0) >= 80:
            reasons.append("Optimal experience level - recently transitioned to industry")
        
        if breakdown.get('text_similarity', 0) >= 60:
            reasons.append("Similar interests and career goals")
        
        if not reasons:
            reasons.append("Good overall compatibility based on multiple factors")
        
        return reasons
