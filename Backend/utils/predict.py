import joblib
import os
import re

# ==========================================
# AUTOMATED CLASSIFICATION SERVICE
# ==========================================

# Path to the saved models
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")

# Load saved models and vectorizer at startup
try:
    category_model = joblib.load(os.path.join(MODELS_DIR, "category_model.pkl"))
    priority_model = joblib.load(os.path.join(MODELS_DIR, "priority_model.pkl"))
    vectorizer = joblib.load(os.path.join(MODELS_DIR, "vectorizer.pkl"))
    print("Classification models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}. Please run train_models.py first.")
    category_model, priority_model, vectorizer = None, None, None

def clean_input_text(text):
    """Simple text cleaning for prediction."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def predict_category_and_priority(complaint_text):
    """
    Accepts complaint text and returns predicted category and priority.
    Uses ML models if available, otherwise falls back to keyword matching.
    """
    text = clean_input_text(complaint_text)
    
    # 1. Try ML Prediction if models are loaded
    if all([category_model, priority_model, vectorizer]):
        try:
            features = vectorizer.transform([text])
            category = category_model.predict(features)[0]
            priority = priority_model.predict(features)[0]
            return category, priority
        except Exception as e:
            print(f"ML Prediction failed, falling back to keywords: {e}")

    # 2. Keyword-based Fallback (matching DOC/bot.md requirements)
    category = "General"
    if any(kw in text for kw in ["water", "supply", "tank", "tap", "pipe"]):
        category = "Water"
    elif any(kw in text for kw in ["electricity", "power", "light", "current"]):
        category = "Electricity"
    elif any(kw in text for kw in ["garbage", "waste", "trash", "dump", "clean"]):
        category = "Waste Management"
    elif any(kw in text for kw in ["road", "pothole", "pavement", "street"]):
        category = "Roads"
    elif any(kw in text for kw in ["drain", "sewer", "gutter", "overflow"]):
        category = "Drainage"
    elif any(kw in text for kw in ["traffic", "signal", "park", "vehicle"]):
        category = "Traffic"
    elif any(kw in text for kw in ["safety", "crime", "theft", "patrol"]):
        category = "Public Safety"
    
    priority = "Medium"
    high_keywords = ["urgent", "emergency", "not available", "broken", "danger", "dead", "high", "morning", "now"]
    low_keywords = ["slow", "low", "sometimes", "maybe", "past"]
    
    if any(kw in text for kw in high_keywords):
        priority = "High"
    elif any(kw in text for kw in low_keywords):
        priority = "Low"
        
    return category, priority

if __name__ == "__main__":
    # Test prediction
    test_text = "The street light in front of my house is blinking and causing issues."
    cat, prio = predict_category_and_priority(test_text)
    print(f"Input: {test_text}")
    print(f"Predicted Category: {cat}")
    print(f"Predicted Priority: {prio}")
