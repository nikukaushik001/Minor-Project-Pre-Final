import cv2
import numpy as np
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global OCR reader instance (Lazy-loaded)
_reader = None

def get_reader():
    """Returns a lazy-loaded instance of the EasyOCR Reader."""
    global _reader
    if _reader is None:
        import easyocr
        logger.info("Initializing EasyOCR Reader (English)...")
        _reader = easyocr.Reader(['en'], gpu=False)
        logger.info("EasyOCR Reader ready.")
    return _reader


def deskew(image):
    """
    Detect and correct image skew (rotation) using Hough transform.
    Fixes tilted scans / photos taken at an angle.
    """
    try:
        coords = np.column_stack(np.where(image < 128))
        if len(coords) < 10:
            return image
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        # Only correct if skew is significant (> 0.5 deg)
        if abs(angle) < 0.5:
            return image
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h),
                                 flags=cv2.INTER_CUBIC,
                                 borderMode=cv2.BORDER_REPLICATE)
        logger.info(f"Deskew applied: {angle:.2f} degrees corrected.")
        return rotated
    except Exception as e:
        logger.warning(f"Deskew failed: {e}")
        return image


def preprocess_image(image_path):
    """
    Advanced image preprocessing pipeline for handwriting & printed text:
    1. Upscale small images (improves EasyOCR accuracy significantly)
    2. Grayscale conversion
    3. Deskew (correct rotation)
    4. CLAHE contrast enhancement
    5. Bilateral denoising (preserves edges better than fastNlMeans)
    6. Unsharp masking (sharpens strokes)
    7. Adaptive thresholding (binarize cleanly)
    Returns the processed numpy array for direct use in EasyOCR.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image at {image_path}")

        # 1. Upscale if image is too small — EasyOCR needs at least ~100px height per line
        h, w = img.shape[:2]
        if max(h, w) < 1000:
            scale = 1500 / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
            logger.info(f"Upscaled image by factor {scale:.2f}x")

        # 2. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Deskew
        gray = deskew(gray)

        # 4. CLAHE — boosts local contrast without over-saturating
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 5. Bilateral filter — denoises while keeping pen stroke edges clean
        denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)

        # 6. Unsharp mask — sharpens ink strokes
        gaussian = cv2.GaussianBlur(denoised, (0, 0), 3)
        sharpened = cv2.addWeighted(denoised, 1.5, gaussian, -0.5, 0)

        # 7. Adaptive thresholding — creates clean black on white binary image
        # EasyOCR works well on clean binarized images for handwriting
        binary = cv2.adaptiveThreshold(
            sharpened, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=31,
            C=15
        )

        return binary

    except Exception as e:
        logger.error(f"Image preprocessing failed: {str(e)}")
        # Return original path as fallback
        return image_path


def sort_results_by_position(results):
    """
    Sort OCR results top-to-bottom, left-to-right using bounding box centroids.
    EasyOCR returns boxes in random order; this restores reading order.
    """
    def centroid_y(r):
        box = r[0]
        ys = [pt[1] for pt in box]
        return sum(ys) / len(ys)

    # Group lines by approximate Y position (within 20px tolerance)
    results_sorted = sorted(results, key=centroid_y)
    return results_sorted


def extract_text(image_path):
    """
    Improved OCR extraction with:
    - Dual-pass: preprocessed image + raw image
    - Position-sorted result reassembly (preserves paragraph structure)
    - Smart confidence weighting
    Returns:
        tuple: (extracted_text, average_confidence)
    """
    reader = get_reader()

    def run_ocr(source, label=""):
        """Run OCR on source (path or numpy array) and return sorted results."""
        try:
            results = reader.readtext(
                source,
                detail=1,
                paragraph=False,         # Keep per-word/line boxes so we can sort
                text_threshold=0.5,      # Lower threshold to catch light handwriting
                low_text=0.3,            # Catch faint/thin strokes
                min_size=10,             # Ignore tiny noise dots
                width_ths=0.7,           # Horizontal merge sensitivity
                height_ths=0.5
            )
            return results
        except Exception as e:
            logger.warning(f"OCR pass '{label}' failed: {e}")
            return []

    def assemble_text(results):
        """Sort and join OCR results into structured text preserving line breaks."""
        if not results:
            return "", 0.0
        sorted_res = sort_results_by_position(results)

        lines = []
        current_line = []
        prev_y = None
        line_height_threshold = 30  # px gap to consider a new line

        for r in sorted_res:
            box, text, conf = r
            avg_y = sum(pt[1] for pt in box) / 4
            if prev_y is None or abs(avg_y - prev_y) < line_height_threshold:
                current_line.append((text, conf))
            else:
                if current_line:
                    lines.append(current_line)
                current_line = [(text, conf)]
            prev_y = avg_y

        if current_line:
            lines.append(current_line)

        assembled_lines = []
        all_confs = []
        for line in lines:
            line_text = " ".join(t for t, c in line)
            assembled_lines.append(line_text)
            all_confs.extend(c for t, c in line)

        full_text = "\n".join(assembled_lines)
        avg_conf = sum(all_confs) / len(all_confs) if all_confs else 0.0
        return full_text, avg_conf

    try:
        # Pass 1: preprocessed image (best for noisy/handwritten)
        processed_img = preprocess_image(image_path)
        results_proc = run_ocr(processed_img, "preprocessed")
        text_proc, conf_proc = assemble_text(results_proc)

        # Pass 2: raw colour image (sometimes better for printed/typed text)
        results_raw = run_ocr(image_path, "raw")
        text_raw, conf_raw = assemble_text(results_raw)

        # Decision: pick the better result
        # Give a slight bonus to preprocessed since it handles handwriting better
        bonus = 0.03
        if conf_proc + bonus >= conf_raw and len(text_proc) >= len(text_raw) * 0.7:
            logger.info(f"Using preprocessed OCR result (conf={conf_proc:.2f})")
            return text_proc, conf_proc
        else:
            logger.info(f"Using raw OCR result (conf={conf_raw:.2f})")
            return text_raw, conf_raw

    except Exception as e:
        logger.error(f"OCR extraction failed: {str(e)}")
        return "", 0.0


def extract_student_id(image_path):
    """
    Attempts to find a Student ID or Roll Number in the top 25% of the image.
    Uses expanded regex patterns for common Indian university roll number formats.
    Returns:
        str: Candidate student ID or None
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        h, w = img.shape[:2]
        top_slice = img[0:int(h * 0.30), 0:w]  # expanded to top 30%

        # Preprocess the slice for better readability
        gray = cv2.cvtColor(top_slice, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        temp_path = "top_slice_temp.jpg"
        cv2.imwrite(temp_path, enhanced)

        reader = get_reader()
        results = reader.readtext(temp_path, detail=1, text_threshold=0.4)

        # Expanded patterns for Indian university roll numbers
        patterns = [
            r"Roll\s*(?:No|Number|\.)?[:\s]*([A-Za-z0-9/\-]+)",
            r"Roll[:\s]*([A-Za-z0-9/\-]+)",
            r"\bRoll\b[^\d]*([A-Z]{2,}/\d{4}/\d{2,})",  # e.g. KRMU/2026/01
            r"ID[:\s]*([A-Za-z0-9]+)",
            r"No\.?[:\s]*([A-Za-z0-9/\-]{4,})",
            r"([A-Z]{2,}/\d{4}/\d{2,})",               # KRMU/2026/01 format
            r"([A-Z]{2,}\d{6,10})",                     # e.g. CS2024001
            r"\b(\d{7,12})\b",                           # Long numeric IDs
        ]

        for res in results:
            box, text, conf = res
            if conf < 0.3:  # Skip very low confidence boxes
                continue
            for p in patterns:
                match = re.search(p, text, re.IGNORECASE)
                if match:
                    id_val = match.group(1) if len(match.groups()) > 0 else match.group(0)
                    clean_id = id_val.strip().replace(" ", "")
                    if len(clean_id) >= 4:  # Minimum valid ID length
                        logger.info(f"Auto-detected Student ID: {clean_id} (Pattern: {p})")
                        return clean_id

        return None
    except Exception as e:
        logger.error(f"Student ID extraction failed: {str(e)}")
        return None
