"""
Sentiment Analysis Service
Uses Logistic Regression with TF-IDF features (Classical ML)
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import joblib
import numpy as np
from typing import List, Dict, Any
import os

class SentimentAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=2
        )
        self.classifier = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        self.is_trained = False
        self.model_path = 'models/sentiment_classifier.pkl'
        self.vectorizer_path = 'models/sentiment_vectorizer.pkl'
        
        # Try to load pre-trained model
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                self.classifier = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.is_trained = True
        except:
            pass
    
    def train(self, texts: List[str], labels: List[str]) -> Dict[str, float]:
        """
        Train sentiment classifier on labeled data.
        Labels should be: 'positive', 'negative', 'neutral'
        """
        if len(texts) != len(labels):
            raise ValueError("Texts and labels must have same length")
        
        # Encode labels
        label_map = {'positive': 1, 'neutral': 0, 'negative': -1}
        y = np.array([label_map[label] for label in labels])
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Fit vectorizer and transform
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        # Train classifier
        self.classifier.fit(X_train_vec, y_train)
        self.is_trained = True
        
        # Evaluate
        y_pred = self.classifier.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average='weighted', zero_division=0
        )
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.classifier, self.model_path)
        joblib.dump(self.vectorizer, self.vectorizer_path)
        
        return {
            'accuracy': round(accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'training_samples': len(texts),
            'test_samples': len(X_test)
        }
    
    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Analyze sentiment for multiple texts"""
        if not self.is_trained:
            # Return neutral for untrained model
            return [{
                'sentiment': 'neutral',
                'confidence': 0.5,
                'scores': {'positive': 0.33, 'neutral': 0.34, 'negative': 0.33}
            } for _ in texts]
        
        results = []
        X = self.vectorizer.transform(texts)
        predictions = self.classifier.predict(X)
        probabilities = self.classifier.predict_proba(X)
        
        label_map_inv = {1: 'positive', 0: 'neutral', -1: 'negative'}
        
        for pred, probs in zip(predictions, probabilities):
            sentiment = label_map_inv[pred]
            confidence = np.max(probs)
            
            # Get class probabilities
            classes = self.classifier.classes_
            scores = {
                label_map_inv[cls]: round(float(prob), 3)
                for cls, prob in zip(classes, probs)
            }
            
            results.append({
                'sentiment': sentiment,
                'confidence': round(float(confidence), 3),
                'scores': scores
            })
        
        return results
    
    def analyze_single(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment for single text"""
        return self.analyze_batch([text])[0]
