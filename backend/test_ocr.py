from ocr.ocr_engine import extract_text

image_path = "data/image_2.jpg"

text = extract_text(image_path)
print("Extracted Text:")
print(text)
