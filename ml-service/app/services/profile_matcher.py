"""
Profile Matching Service
Uses TF-IDF, Word2Vec, and Jaccard similarity for matching students with alumni
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any
import numpy as np

class ProfileMatcher:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
    
    def match(self, student_profile: Dict[str, Any], alumni_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate match percentage between student and alumni profiles.
        
        Returns breakdown of:
        - skills_overlap: Jaccard similarity of skills
        - text_similarity: TF-IDF cosine similarity of bio + headline
        - branch_match: Boolean match
        - experience_relevance: Normalized score
        """
        
        # 1. Skills Overlap (Jaccard Index)
        student_skills = set(student_profile.get('skills', []))
        alumni_skills = set(alumni_profile.get('skills', []))
        
        if student_skills and alumni_skills:
            intersection = len(student_skills & alumni_skills)
            union = len(student_skills | alumni_skills)
            skills_score = intersection / union if union > 0 else 0
        else:
            skills_score = 0
        
        # 2. Text Similarity (TF-IDF)
        student_text = f"{student_profile.get('bio', '')} {student_profile.get('headline', '')}"
        alumni_text = f"{alumni_profile.get('bio', '')} {alumni_profile.get('headline', '')}"
        
        if student_text.strip() and alumni_text.strip():
            try:
                tfidf_matrix = self.tfidf_vectorizer.fit_transform([student_text, alumni_text])
                text_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            except:
                text_score = 0
        else:
            text_score = 0
        
        # 3. Branch Match
        student_branch = student_profile.get('branch', '')
        alumni_branch = alumni_profile.get('branch', '')
        branch_score = 1.0 if student_branch == alumni_branch else 0.3
        
        # 4. Experience Relevance (years since graduation)
        alumni_years = alumni_profile.get('years_of_experience', 0)
        if alumni_years >= 2 and alumni_years <= 8:
            experience_score = 1.0  # Sweet spot: 2-8 years
        elif alumni_years > 8:
            experience_score = 0.8  # Still valuable but may be too senior
        else:
            experience_score = 0.5  # Very recent grad
        
        # Weighted combination
        weights = {
            'skills_overlap': 0.35,
            'text_similarity': 0.30,
            'branch_match': 0.15,
            'experience_relevance': 0.20
        }
        
        breakdown = {
            'skills_overlap': round(skills_score * 100, 2),
            'text_similarity': round(text_score * 100, 2),
            'branch_match': round(branch_score * 100, 2),
            'experience_relevance': round(experience_score * 100, 2)
        }
        
        # Calculate weighted match
        match_percent = (
            skills_score * weights['skills_overlap'] +
            text_score * weights['text_similarity'] +
            branch_score * weights['branch_match'] +
            experience_score * weights['experience_relevance']
        ) * 100
        
        # Generate explanation
        common_skills = list(student_skills & alumni_skills) if student_skills and alumni_skills else []
        explanation = self._generate_explanation(match_percent, common_skills, branch_score, alumni_years)
        
        return {
            'match_percent': round(match_percent, 2),
            'breakdown': breakdown,
            'explanation': explanation
        }
    
    def _generate_explanation(self, match_percent: float, common_skills: list, branch_score: float, years: int) -> str:
        """Generate human-readable explanation"""
        if match_percent >= 80:
            strength = "excellent"
        elif match_percent >= 60:
            strength = "good"
        elif match_percent >= 40:
            strength = "moderate"
        else:
            strength = "basic"
        
        parts = [f"This is a {strength} match ({match_percent:.0f}%)."]
        
        if common_skills:
            parts.append(f"Common skills: {', '.join(common_skills[:3])}" + 
                        (f" (+{len(common_skills)-3} more)" if len(common_skills) > 3 else "") + ".")
        
        if branch_score == 1.0:
            parts.append("Same branch/department.")
        
        if years >= 2 and years <= 8:
            parts.append(f"Alumni has {years} years of relevant industry experience.")
        
        return " ".join(parts)
