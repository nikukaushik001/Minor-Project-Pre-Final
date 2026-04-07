import re

def clean_text(text: str) -> str:
    """
    Cleans OCR output text:
    - Normalises whitespace and line endings
    - Removes stray control characters
    - Collapses multiple spaces/newlines
    - Keeps punctuation and scientific characters (%, =, +, etc.)
    """
    if not text:
        return ""

    text = str(text)

    # Remove non-printable control characters (except newline and tab)
    text = re.sub(r'[^\x09\x0A\x20-\x7E]', ' ', text)

    # Normalise smart quotes and dashes
    text = text.replace('\u2019', "'").replace('\u2018', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2013', '-').replace('\u2014', '-')

    # Collapse multiple spaces within a line
    text = re.sub(r'[ \t]+', ' ', text)

    # Collapse 3+ consecutive newlines into 2 (preserve paragraph structure)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def fix_common_ocr_errors(text: str) -> str:
    """
    Fixes common OCR character confusions that are deterministic:
    - '0' (zero) vs 'O' in specific numeric contexts
    - '1' vs 'l' or 'I' in numeric contexts
    - Broken punctuation artifacts
    Does NOT use a general spell checker (which corrupts domain-specific terms).
    """
    if not text:
        return ""

    # Fix zero/O confusion in numeric patterns like "F=ma" or "CO2"
    # E.g. "phot0synthesis" → "photosynthesis" is too risky to blanket-apply
    # Instead, fix only obvious isolated OCR artifacts:

    # Fix '|' (pipe) misread as 'l' or 'I' in the middle of words
    text = re.sub(r'\|', 'l', text)

    # Fix '" ' (errant double quote at start of words) — common OCR artifact
    text = re.sub(r'(?<!\w)"(?=\w)', '', text)
    text = re.sub(r'(?<=\w)"(?!\w)', '', text)

    # Fix common ligature issues ('fi', 'ff', 'fl' sometimes become single char)
    text = text.replace('\ufb01', 'fi').replace('\ufb02', 'fl').replace('\ufb00', 'ff')

    # Remove lone special characters that are clearly noise
    text = re.sub(r'(?<!\w)[~`@#$^*_\\]{1,2}(?!\w)', '', text)

    return text


def preprocess_text(text: str) -> str:
    """
    NLP preprocessing pipeline for OCR output before evaluation:
    1. Basic cleaning (normalise whitespace, remove control chars)
    2. Fix deterministic OCR character errors (no spell checker)
    
    WHY NO SPELL CHECKER:
    General spell checkers (pyspellchecker, autocorrect) are trained on
    everyday English and aggressively "correct" domain-specific academic
    vocabulary. For example:
      - "photosynthesis" → may become "photo synthesis" or worse
      - "chlorophyll" → gets flagged as unknown and replaced wrongly
      - "ACID" (database term) → gets corrupted
    This destroys the keyword matching and semantic scoring accuracy.
    The NLP evaluator's fuzzy matching already handles minor OCR typos.
    """
    cleaned = clean_text(text)
    fixed = fix_common_ocr_errors(cleaned)
    return fixed
