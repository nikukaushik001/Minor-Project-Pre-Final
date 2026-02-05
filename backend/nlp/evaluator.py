from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def evaluate_answer(student_answer, model_answer):
    """
    Compares student answer with model answer
    Returns similarity score between 0 and 1
    """
    # vectorizer = TfidfVectorizer()
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    vectors = vectorizer.fit_transform([student_answer, model_answer])
    similarity = cosine_similarity(vectors[0], vectors[1])[0][0]
    return similarity

def assign_marks(similarity, max_marks=10):
    """
    Converts similarity score into marks
    """
    if similarity >= 0.75:
        return max_marks
    elif similarity >= 0.5:
        return int(max_marks * 0.7)
    elif similarity >= 0.3:
        return int(max_marks * 0.5)
    elif similarity >= 0.1:
        return int(max_marks * 0.3)
    else:
        return 0

def generate_feedback(similarity):
    """
    Generates textual feedback based on similarity score
    """
    if similarity >= 0.75:
        return "Excellent answer. Covers most of the required points."
    elif similarity >= 0.5:
        return "Good answer, but some important points are missing."
    elif similarity >= 0.3:
        return "Average answer. Needs more explanation and clarity."
    elif similarity >= 0.1:
        return "Poor answer. Content is weak or partially irrelevant."
    else:
        return "Answer is not relevant to the given question."
