from ocr.ocr_engine import extract_text
from nlp.evaluator import evaluate_answer, assign_marks, generate_feedback
# from utils.preprocessing import clean_text


# model_answer = clean_text(model_answer)

# Paths
image_path = "data/sample_image1.jpg"
model_answer_path = "data/model_answer.txt"

# Read model answer
with open(model_answer_path, "r") as file:
    model_answer = file.read()

# OCR extraction
# student_answer = clean_text(extract_text(image_path))
student_answer = extract_text(image_path)

# NLP evaluation
# similarity = clean_text(evaluate_answer(student_answer, model_answer))
similarity = evaluate_answer(student_answer, model_answer)
marks = assign_marks(similarity)
feedback = generate_feedback(similarity)


print("Student Answer (Extracted):")
print(student_answer)
print("\nModel Answer:")
print(model_answer)
print("\nSimilarity Score:", round(similarity, 2))
print("Marks Awarded:", marks, "/ 10")
print("Feedback:", feedback)

