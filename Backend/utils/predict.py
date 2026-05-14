import joblib
import os
import re

# ==========================================
# AI PREDICTION SERVICE (Prompt 7)
# ==========================================

# Path to the saved models
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")

# Load saved models and vectorizer at startup
try:
    category_model = joblib.load(os.path.join(MODELS_DIR, "category_model.pkl"))
    priority_model = joblib.load(os.path.join(MODELS_DIR, "priority_model.pkl"))
    vectorizer = joblib.load(os.path.join(MODELS_DIR, "vectorizer.pkl"))
    print("AI Models loaded successfully.")
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
    """
    if not all([category_model, priority_model, vectorizer]):
        return "Unknown", "Medium"

    # Preprocess
    cleaned_text = clean_input_text(complaint_text)
    
    # Transform text to TF-IDF features
    features = vectorizer.transform([cleaned_text])
    
    # Predict
    category = category_model.predict(features)[0]
    priority = priority_model.predict(features)[0]
    
    return category, priority

if __name__ == "__main__":
    # Test prediction
    test_text = "The street light in front of my house is blinking and causing issues."
    cat, prio = predict_category_and_priority(test_text)
    print(f"Input: {test_text}")
    print(f"Predicted Category: {cat}")
    print(f"Predicted Priority: {prio}")
