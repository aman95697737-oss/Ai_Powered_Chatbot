import json
import logging
import math
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", 
    "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", 
    "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", 
    "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", 
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", 
    "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", 
    "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", 
    "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", 
    "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
    "please", "tell", "give", "know", "want"
}


class DatasetService:
    def __init__(self, data_path: Optional[str] = None):
        if data_path:
            self.data_path = Path(data_path)
        else:
            # Default to backend/data/student_faq.json
            base_dir = Path(__file__).resolve().parent.parent
            self.data_path = base_dir / "data" / "student_faq.json"
        
        self.faqs: List[Dict] = []
        self.load_data()

    def load_data(self):
        try:
            if not self.data_path.exists():
                logger.error(f"Dataset file not found at: {self.data_path}")
                self.faqs = []
                return

            with open(self.data_path, "r", encoding="utf-8") as f:
                self.faqs = json.load(f)
            logger.info(f"Loaded {len(self.faqs)} FAQ records from {self.data_path}")
        except Exception as e:
            logger.error(f"Error loading dataset: {e}", exc_info=True)
            self.faqs = []

    @staticmethod
    def tokenize(text: str) -> List[str]:
        if not text:
            return []
        # Lowercase and extract alphanumeric words
        clean_text = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = [token.strip() for token in clean_text.split() if token.strip()]
        return tokens

    @classmethod
    def filter_meaningful_tokens(cls, text: str) -> List[str]:
        tokens = cls.tokenize(text)
        return [t for t in tokens if t not in STOPWORDS and len(t) > 1]

    def find_best_match(self, query: str, threshold: float = 0.20) -> Tuple[Optional[Dict], float]:
        """
        Finds the most relevant FAQ using a multi-factor score:
        1. Exact query match
        2. Keyword match score
        3. Token overlap (Jaccard similarity on meaningful tokens)
        4. Substring and token containment in FAQ question and answer
        """
        if not self.faqs or not query:
            return None, 0.0

        query_clean = query.strip().lower()
        query_tokens = self.tokenize(query_clean)
        query_meaningful = set(self.filter_meaningful_tokens(query_clean))

        best_faq = None
        highest_score = 0.0

        for item in self.faqs:
            q_text = item.get("question", "").lower()
            a_text = item.get("answer", "").lower()
            category = item.get("category", "").lower()
            keywords = [k.lower() for k in item.get("keywords", [])]

            score = 0.0

            # 1. Exact match on question
            if query_clean == q_text:
                return item, 1.0

            # 2. Direct substring match
            if query_clean in q_text:
                score += 0.65
            elif q_text in query_clean:
                score += 0.55

            # 3. Question tokens overlap
            q_meaningful = set(self.filter_meaningful_tokens(q_text))
            if query_meaningful and q_meaningful:
                intersection = query_meaningful.intersection(q_meaningful)
                union = query_meaningful.union(q_meaningful)
                jaccard_q = len(intersection) / len(union) if union else 0.0
                score += jaccard_q * 0.50

                # Check if all query meaningful tokens are inside question tokens
                if query_meaningful.issubset(q_meaningful):
                    score += 0.35

            # 4. Keyword matches
            matched_keywords = 0
            for kw in keywords:
                kw_tokens = set(self.filter_meaningful_tokens(kw))
                if kw in query_clean:
                    score += 0.40
                    matched_keywords += 1
                elif kw_tokens and kw_tokens.issubset(query_meaningful):
                    score += 0.30
                    matched_keywords += 1

            # 5. Category boost if category word appears in query
            if category in query_clean:
                score += 0.25

            # 6. Answer tokens slight overlap
            a_meaningful = set(self.filter_meaningful_tokens(a_text))
            if query_meaningful and a_meaningful:
                a_overlap = len(query_meaningful.intersection(a_meaningful)) / max(len(query_meaningful), 1)
                score += a_overlap * 0.15

            # Normalize approximate score to max 1.0 scale
            normalized_score = min(score, 1.0)

            if normalized_score > highest_score:
                highest_score = normalized_score
                best_faq = item

        if highest_score >= threshold and best_faq:
            return best_faq, round(highest_score, 3)

        return None, round(highest_score, 3)

    def get_all_faqs(self) -> List[Dict]:
        return self.faqs

    def get_categories(self) -> List[str]:
        cats = sorted(list({item["category"] for item in self.faqs if "category" in item}))
        return cats

    def get_faqs_by_category(self, category: str) -> List[Dict]:
        return [item for item in self.faqs if item.get("category", "").lower() == category.lower()]

    def get_suggested_questions(self, current_category: Optional[str] = None, limit: int = 4) -> List[str]:
        suggestions = []
        if current_category:
            cat_faqs = self.get_faqs_by_category(current_category)
            suggestions = [item["question"] for item in cat_faqs[:limit]]
        
        if len(suggestions) < limit:
            popular_defaults = [
                "What is the minimum attendance requirement?",
                "How can I apply for a scholarship?",
                "When are the semester exams?",
                "How do I access the library?",
                "What documents are required for admission?",
                "How can I apply for an internship?"
            ]
            for q in popular_defaults:
                if q not in suggestions:
                    suggestions.append(q)
                if len(suggestions) >= limit:
                    break

        return suggestions[:limit]


# Singleton instance
dataset_service = DatasetService()
