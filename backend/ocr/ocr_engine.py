import easyocr

# Initialize OCR reader (English language)
reader = easyocr.Reader(['en'], gpu=False)

def extract_text(image_path):
    """
    Takes image path as input
    Returns extracted text as a single string
    """
    result = reader.readtext(image_path, detail=0)
    text = " ".join(result)
    return text
