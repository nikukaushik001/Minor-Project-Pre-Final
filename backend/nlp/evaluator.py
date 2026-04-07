import logging
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HybridEvaluator:
    def __init__(self, semantic_model_name='all-MiniLM-L6-v2'):
        """
        Initializes the HybridEvaluator with:
        1. SentenceTransformer for Semantic Similarity
        2. KeyBERT for Keyword Extraction
        """
        from sentence_transformers import SentenceTransformer
        from keybert import KeyBERT
        
        logger.info("Loading Semantic Model...")
        self.semantic_model = SentenceTransformer(semantic_model_name)
        
        logger.info("Loading Keyword Model...")
        # KeyBERT can use the same model to save memory
        self.kw_model = KeyBERT(model=self.semantic_model)

    def get_semantic_score(self, student_answer: str, model_answer: str) -> float:
        """
        Calculates cosine similarity between embeddings.
        Returns score between 0.0 and 1.0
        """
        from sentence_transformers import util
        embeddings = self.semantic_model.encode([student_answer, model_answer], convert_to_tensor=True)
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        return float(similarity[0][0])

    def get_keyword_score(self, student_answer: str, model_answer: str, user_keywords: str = None, top_n=5) -> dict:
        """
        Extracts keywords from Model Answer and checks if they exist in Student Answer.
        Uses fuzzy sequence matching for higher precision with varied student phrasing.
        """
        import difflib
        
        target_keywords = []
        if user_keywords:
            target_keywords = [kw.strip() for kw in user_keywords.split(",") if kw.strip()]
        
        if not target_keywords or len(target_keywords) < top_n:
            keywords_with_scores = self.kw_model.extract_keywords(
                model_answer, 
                keyphrase_ngram_range=(1, 2), 
                stop_words='english', 
                top_n=top_n
            )
            extracted = [kw[0] for kw in keywords_with_scores]
            for ekw in extracted:
                if ekw.lower() not in [tk.lower() for tk in target_keywords]:
                    target_keywords.append(ekw)

        found = []
        missing = []
        student_words = student_answer.lower().split()
        
        for kw in target_keywords:
            kw_lower = kw.lower()
            # 1. Direct check
            if kw_lower in student_answer.lower():
                found.append(kw)
                continue
            
            # 2. Fuzzy check for typos or variations (Fuzzy Precision)
            is_fuzzy_match = False
            for word in student_words:
                ratio = difflib.SequenceMatcher(None, kw_lower, word).ratio()
                if ratio > 0.85: # High precision threshold
                    found.append(kw)
                    is_fuzzy_match = True
                    break
            
            if not is_fuzzy_match:
                missing.append(kw)
                
        if not target_keywords:
            return 0.0, [], []
            
        score = len(found) / len(target_keywords)
        return score, found, missing

    def evaluate(self, student_answer: str, model_answer: str, user_keywords: str = None) -> dict:
        """
        Reasoning-First evaluation logic. 
        Focuses on structural understanding and technical precision.
        """
        if not student_answer.strip():
            return {
                "total_score": 0.0,
                "semantic_score": 0.0,
                "keyword_score": 0.0,
                "keywords_found": [],
                "keywords_missing": [],
                "reasoning": "No content detected in the input fragment.",
                "remediation": "Please ensure the answer sheet is fully captured."
            }

        # 1. Semantic Score (Contextual Understanding)
        semantic_score = self.get_semantic_score(student_answer, model_answer)
        
        # 2. Keyword Score (Technical Precision)
        keyword_score, found, missing = self.get_keyword_score(student_answer, model_answer, user_keywords)
        
        # 3. Structural Reasoning
        reasoning = []
        if semantic_score > 0.85:
            reasoning.append("The answer shows a great understanding of the topic.")
        elif semantic_score > 0.6:
            reasoning.append("The answer covers the main points but could use more detail.")
        else:
            reasoning.append("The answer is missing several key concepts.")

        if keyword_score > 0.8:
            reasoning.append("All important terms were used correctly.")
        elif keyword_score > 0.4:
            reasoning.append("Some key terms are missing from the explanation.")
        else:
            reasoning.append("Many important keywords are missing.")

        # 4. Remediation logic
        remediation = "Try to use more specific keywords in your explanation next time."
        if missing:
            remediation = f"Make sure to explain the concept of '{missing[0]}' more clearly."
        elif semantic_score < 0.6:
            remediation = "Review the main ideas of this topic to improve your overall answer."

        # 5. Adaptive Fusion (Precision Logic)
        if semantic_score > 0.9:
            total_score = (semantic_score * 0.8) + (keyword_score * 0.2)
        elif keyword_score > 0.8:
            total_score = (semantic_score * 0.3) + (keyword_score * 0.7)
        else:
            total_score = (semantic_score * 0.5) + (keyword_score * 0.5)
        
        # AI Bonus for total mastery
        if semantic_score > 0.85 and keyword_score > 0.85:
            total_score = min(1.0, total_score + 0.05)
        
        return {
            "total_score": round(total_score, 2),
            "semantic_score": round(semantic_score, 2),
            "keyword_score": round(keyword_score, 2),
            "keywords_found": found,
            "keywords_missing": missing,
            "reasoning": " ".join(reasoning),
            "remediation": remediation
        }

# Global instance
_evaluator = None

def get_evaluator():
    global _evaluator
    if _evaluator is None:
        logger.info("System initializing AI Evaluator... please wait (this can take 30-60 seconds on first run)")
        _evaluator = HybridEvaluator()
        logger.info("AI Evaluator successfully loaded.")
    return _evaluator

def assign_marks(total_score: float, max_marks: int = 10) -> float:
    return round(total_score * max_marks, 1)

def generate_detailed_feedback(eval_result: dict, ocr_conf: float) -> str:
    """
    Professional, Minimalist Feedback Generator.
    Focuses on clarity and actionable insights.
    """
    score = eval_result['total_score']
    reasoning = eval_result.get('reasoning', '')
    remediation = eval_result.get('remediation', '')
    
    feedback = []
    
    # 1. Performance Indicator
    level = "Standard"
    if score >= 0.9: level = "Mastery"
    elif score >= 0.75: level = "Proficient"
    elif score >= 0.5: level = "Adequate"
    else: level = "Review Required"
    
    feedback.append(f"Performance Level: {level}.")
    
    # 2. Add AI Reasoning
    if reasoning:
        feedback.append(f"Analysis: {reasoning}")
        
    # 3. Add Remediation
    if remediation and score < 0.9:
        feedback.append(f"Remediation: {remediation}")
        
    # 4. Accuracy Note
    if ocr_conf < 0.5:
        feedback.append("Note: Extraction accuracy may be limited by handwriting clarity.")
        
    return " ".join(feedback)
