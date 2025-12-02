"""
Topic Modeling Service
Uses LDA (Latent Dirichlet Allocation) and keyword extraction (RAKE/YAKE)
"""
from gensim import corpora
from gensim.models import LdaModel
from gensim.models.coherencemodel import CoherenceModel
import yake
from rake_nltk import Rake
import nltk
from typing import List, Dict, Any
import re

# Download required NLTK data
try:
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)
try:
    nltk.data.find('punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

class TopicModeler:
    def __init__(self):
        self.stop_words = set(nltk.corpus.stopwords.words('english'))
        self.yake_extractor = yake.KeywordExtractor(
            lan="en",
            n=3,  # max n-gram size
            dedupLim=0.9,
            top=10
        )
    
    def _preprocess(self, text: str) -> List[str]:
        """Preprocess text for topic modeling"""
        # Lowercase and remove special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        # Tokenize
        tokens = text.split()
        # Remove stopwords and short tokens
        tokens = [t for t in tokens if t not in self.stop_words and len(t) > 3]
        return tokens
    
    def extract_topics(self, texts: List[str], num_topics: int = 5) -> Dict[str, Any]:
        """
        Extract topics using LDA.
        Returns topics with keywords and coherence score.
        """
        if not texts or len(texts) < num_topics:
            return {
                'topics': [],
                'coherence_score': 0.0
            }
        
        # Preprocess documents
        processed_docs = [self._preprocess(text) for text in texts]
        processed_docs = [doc for doc in processed_docs if len(doc) > 3]
        
        if not processed_docs:
            return {
                'topics': [],
                'coherence_score': 0.0
            }
        
        # Create dictionary and corpus
        dictionary = corpora.Dictionary(processed_docs)
        dictionary.filter_extremes(no_below=2, no_above=0.8)
        corpus = [dictionary.doc2bow(doc) for doc in processed_docs]
        
        if not corpus or len(dictionary) < 10:
            return {
                'topics': [],
                'coherence_score': 0.0
            }
        
        # Train LDA model
        lda_model = LdaModel(
            corpus=corpus,
            num_topics=num_topics,
            id2word=dictionary,
            random_state=42,
            passes=10,
            alpha='auto',
            per_word_topics=True
        )
        
        # Calculate coherence
        try:
            coherence_model = CoherenceModel(
                model=lda_model,
                texts=processed_docs,
                dictionary=dictionary,
                coherence='c_v'
            )
            coherence_score = coherence_model.get_coherence()
        except:
            coherence_score = 0.0
        
        # Extract topics
        topics = []
        for topic_id in range(num_topics):
            topic_words = lda_model.show_topic(topic_id, topn=10)
            topics.append({
                'topic_id': topic_id,
                'keywords': [word for word, _ in topic_words],
                'weights': [round(float(weight), 4) for _, weight in topic_words],
                'top_keywords': [word for word, _ in topic_words[:5]]
            })
        
        return {
            'topics': topics,
            'coherence_score': round(coherence_score, 4)
        }
    
    def extract_keywords_yake(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Extract keywords using YAKE algorithm"""
        results = []
        for text in texts:
            keywords = self.yake_extractor.extract_keywords(text)
            results.append({
                'text_preview': text[:100] + '...' if len(text) > 100 else text,
                'keywords': [
                    {'keyword': kw, 'score': round(score, 4)}
                    for kw, score in keywords
                ]
            })
        return results
    
    def extract_keywords_rake(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Extract keywords using RAKE algorithm"""
        rake = Rake()
        results = []
        
        for text in texts:
            rake.extract_keywords_from_text(text)
            keywords = rake.get_ranked_phrases_with_scores()
            results.append({
                'text_preview': text[:100] + '...' if len(text) > 100 else text,
                'keywords': [
                    {'keyword': phrase, 'score': round(score, 4)}
                    for score, phrase in keywords[:10]
                ]
            })
        
        return results
    
    def get_trending_keywords(self, texts: List[str], top_n: int = 20) -> List[Dict[str, Any]]:
        """Get trending keywords across all texts"""
        all_keywords = {}
        
        for text in texts:
            keywords = self.yake_extractor.extract_keywords(text)
            for kw, score in keywords:
                if kw in all_keywords:
                    all_keywords[kw]['count'] += 1
                    all_keywords[kw]['total_score'] += score
                else:
                    all_keywords[kw] = {
                        'keyword': kw,
                        'count': 1,
                        'total_score': score
                    }
        
        # Sort by frequency and average score
        trending = sorted(
            all_keywords.values(),
            key=lambda x: (x['count'], -x['total_score'] / x['count']),
            reverse=True
        )[:top_n]
        
        return [
            {
                'keyword': item['keyword'],
                'frequency': item['count'],
                'avg_score': round(item['total_score'] / item['count'], 4)
            }
            for item in trending
        ]
