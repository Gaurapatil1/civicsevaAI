import pandas as pd
import re
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ==========================================
# COMPLAINT DATASET INTEGRATION & ML TRAINING
# ==========================================

def clean_text(text):
    """
    Cleans complaint text by converting to lowercase and 
    removing special characters using regex.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text.strip()

def train_and_save_models():
    """
    Loads dataset, cleans text, trains category and priority models,
    and saves them using joblib.
    """
    # Define paths
    base_path = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_path, "..", "data", "complaints_dataset.csv")
    models_dir = os.path.join(base_path, "..", "models")

    # Create models directory if it doesn't exist
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # 1. DATA LOADING
    print("Loading complaints dataset...")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return
    
    df = pd.read_csv(csv_path)

    # 2. PREPROCESSING
    print("Preprocessing complaint text...")
    df['clean_text'] = df['complaint_text'].apply(clean_text)

    # 3. VECTORIZATION (TF-IDF)
    print("Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X = vectorizer.fit_transform(df['clean_text'])

    # 4. CATEGORY PREDICTION MODEL (Prompt 5)
    print("Training Category Prediction Model...")
    y_category = df['category']
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X, y_category, test_size=0.2, random_state=42
    )

    category_model = RandomForestClassifier(n_estimators=100, random_state=42)
    category_model.fit(X_train_c, y_train_c)

    # Evaluation
    y_pred_c = category_model.predict(X_test_c)
    cat_accuracy = accuracy_score(y_test_c, y_pred_c)
    print(f"Category Model Accuracy: {cat_accuracy:.2%}")

    # 5. PRIORITY PREDICTION MODEL (Prompt 6)
    print("Training Priority Prediction Model...")
    y_priority = df['priority']
    
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
        X, y_priority, test_size=0.2, random_state=42
    )

    priority_model = RandomForestClassifier(n_estimators=100, random_state=42)
    priority_model.fit(X_train_p, y_train_p)

    # Evaluation
    y_pred_p = priority_model.predict(X_test_p)
    prio_accuracy = accuracy_score(y_test_p, y_pred_p)
    print(f"Priority Model Accuracy: {prio_accuracy:.2%}")

    # 6. SAVE MODELS & VECTORIZER
    print("Saving models and vectorizer...")
    joblib.dump(category_model, os.path.join(models_dir, "category_model.pkl"))
    joblib.dump(priority_model, os.path.join(models_dir, "priority_model.pkl"))
    joblib.dump(vectorizer, os.path.join(models_dir, "vectorizer.pkl"))

    print("-" * 30)
    print("Workflow clearly explained: Text cleaned -> TF-IDF Vectorized -> RandomForest Trained -> Models Saved.")
    print("-" * 30)

if __name__ == "__main__":
    train_and_save_models()
