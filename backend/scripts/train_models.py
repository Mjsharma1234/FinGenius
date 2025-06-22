#!/usr/bin/env python3
"""
FinGenius ML Model Training Script
Trains and manages AI/ML models for fraud detection, spending prediction, and financial insights.
"""

import os
import sys
import json
import pickle
import logging
import argparse
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ml_training.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class FinGeniusMLTrainer:
    def __init__(self, models_dir='models', data_dir='data'):
        self.models_dir = Path(models_dir)
        self.data_dir = Path(data_dir)
        self.models_dir.mkdir(exist_ok=True)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize model containers
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        
        # Set random seeds for reproducibility
        np.random.seed(42)
        tf.random.set_seed(42)
        
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic financial data for training"""
        logger.info("Generating synthetic training data...")
        
        # Fraud detection data
        fraud_data = self._generate_fraud_data(n_samples)
        
        # Spending prediction data
        spending_data = self._generate_spending_data(n_samples)
        
        # Sentiment analysis data
        sentiment_data = self._generate_sentiment_data(n_samples // 2)
        
        return {
            'fraud': fraud_data,
            'spending': spending_data,
            'sentiment': sentiment_data
        }
    
    def _generate_fraud_data(self, n_samples):
        """Generate synthetic fraud detection data"""
        np.random.seed(42)
        
        # Normal transactions (80%)
        n_normal = int(n_samples * 0.8)
        normal_data = {
            'amount': np.random.normal(100, 50, n_normal),
            'hour': np.random.randint(0, 24, n_normal),
            'day_of_week': np.random.randint(0, 7, n_normal),
            'location_similarity': np.random.uniform(0.7, 1.0, n_normal),
            'merchant_category': np.random.uniform(0.3, 0.9, n_normal),
            'user_behavior_score': np.random.uniform(0.6, 1.0, n_normal),
            'device_fingerprint': np.random.uniform(0.8, 1.0, n_normal),
            'transaction_frequency': np.random.uniform(0.4, 0.8, n_normal),
            'amount_pattern': np.random.uniform(0.5, 0.9, n_normal),
            'time_pattern': np.random.uniform(0.6, 0.9, n_normal),
            'is_fraud': np.zeros(n_normal)
        }
        
        # Fraudulent transactions (20%)
        n_fraud = n_samples - n_normal
        fraud_data = {
            'amount': np.random.normal(500, 200, n_fraud),
            'hour': np.random.randint(0, 24, n_fraud),
            'day_of_week': np.random.randint(0, 7, n_fraud),
            'location_similarity': np.random.uniform(0.0, 0.3, n_fraud),
            'merchant_category': np.random.uniform(0.0, 0.5, n_fraud),
            'user_behavior_score': np.random.uniform(0.0, 0.4, n_fraud),
            'device_fingerprint': np.random.uniform(0.0, 0.5, n_fraud),
            'transaction_frequency': np.random.uniform(0.0, 0.3, n_fraud),
            'amount_pattern': np.random.uniform(0.0, 0.4, n_fraud),
            'time_pattern': np.random.uniform(0.0, 0.3, n_fraud),
            'is_fraud': np.ones(n_fraud)
        }
        
        # Combine data
        combined_data = {}
        for key in normal_data.keys():
            combined_data[key] = np.concatenate([normal_data[key], fraud_data[key]])
        
        return pd.DataFrame(combined_data)
    
    def _generate_spending_data(self, n_samples):
        """Generate synthetic spending prediction data"""
        np.random.seed(42)
        
        # Generate time series data
        dates = pd.date_range(start='2023-01-01', periods=n_samples, freq='D')
        
        # Base spending with seasonal patterns
        base_spending = 100 + 20 * np.sin(2 * np.pi * dates.dayofyear / 365)
        
        # Add weekly patterns
        weekly_pattern = 10 * np.sin(2 * np.pi * dates.dayofweek / 7)
        
        # Add random noise
        noise = np.random.normal(0, 15, n_samples)
        
        # Generate features
        data = {
            'date': dates,
            'spending': np.maximum(0, base_spending + weekly_pattern + noise),
            'income': np.random.normal(200, 50, n_samples),
            'day_of_month': dates.day,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'is_weekend': (dates.dayofweek >= 5).astype(int),
            'is_month_end': (dates.day >= 25).astype(int)
        }
        
        return pd.DataFrame(data)
    
    def _generate_sentiment_data(self, n_samples):
        """Generate synthetic sentiment analysis data"""
        np.random.seed(42)
        
        # Positive financial terms
        positive_terms = [
            'profit', 'gain', 'increase', 'growth', 'positive', 'good', 'excellent',
            'successful', 'profitable', 'rising', 'bullish', 'optimistic', 'strong',
            'recovery', 'surge', 'rally', 'breakthrough', 'milestone', 'achievement'
        ]
        
        # Negative financial terms
        negative_terms = [
            'loss', 'decrease', 'decline', 'negative', 'bad', 'poor', 'failing',
            'unprofitable', 'falling', 'bearish', 'pessimistic', 'debt', 'crash',
            'crisis', 'recession', 'bankruptcy', 'default', 'volatile', 'risky'
        ]
        
        # Generate sentences
        sentences = []
        sentiments = []
        
        for _ in range(n_samples):
            if np.random.random() > 0.5:
                # Positive sentence
                words = np.random.choice(positive_terms, size=np.random.randint(2, 5))
                sentence = f"The market shows {' '.join(words)} with strong fundamentals."
                sentences.append(sentence)
                sentiments.append('positive')
            else:
                # Negative sentence
                words = np.random.choice(negative_terms, size=np.random.randint(2, 5))
                sentence = f"Investors worry about {' '.join(words)} affecting returns."
                sentences.append(sentence)
                sentiments.append('negative')
        
        return pd.DataFrame({
            'text': sentences,
            'sentiment': sentiments
        })
    
    def train_fraud_detection_model(self, data):
        """Train fraud detection model"""
        logger.info("Training fraud detection model...")
        
        # Prepare features
        feature_columns = [
            'amount', 'hour', 'day_of_week', 'location_similarity',
            'merchant_category', 'user_behavior_score', 'device_fingerprint',
            'transaction_frequency', 'amount_pattern', 'time_pattern'
        ]
        
        X = data[feature_columns].values
        y = data['is_fraud'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train multiple models
        models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'neural_network': MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42),
            'svm': SVC(kernel='rbf', probability=True, random_state=42)
        }
        
        best_model = None
        best_score = 0
        
        for name, model in models.items():
            logger.info(f"Training {name}...")
            model.fit(X_train_scaled, y_train)
            score = model.score(X_test_scaled, y_test)
            logger.info(f"{name} accuracy: {score:.4f}")
            
            if score > best_score:
                best_score = score
                best_model = model
        
        # Save best model and scaler
        self.models['fraud_detection'] = best_model
        self.scalers['fraud_detection'] = scaler
        
        # Evaluate best model
        y_pred = best_model.predict(X_test_scaled)
        logger.info(f"Best fraud detection model accuracy: {best_score:.4f}")
        logger.info(f"Classification report:\n{classification_report(y_test, y_pred)}")
        
        return best_model, scaler
    
    def train_spending_prediction_model(self, data):
        """Train spending prediction model"""
        logger.info("Training spending prediction model...")
        
        # Prepare features
        feature_columns = [
            'income', 'day_of_month', 'day_of_week', 'month',
            'is_weekend', 'is_month_end'
        ]
        
        # Create lag features
        data['spending_lag1'] = data['spending'].shift(1)
        data['spending_lag7'] = data['spending'].shift(7)
        data['spending_rolling_mean'] = data['spending'].rolling(window=7).mean()
        
        # Drop NaN values
        data = data.dropna()
        
        X = data[feature_columns + ['spending_lag1', 'spending_lag7', 'spending_rolling_mean']].values
        y = data['spending'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = MLPClassifier(
            hidden_layer_sizes=(100, 50, 25),
            max_iter=1000,
            random_state=42,
            learning_rate='adaptive'
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Save model and scaler
        self.models['spending_prediction'] = model
        self.scalers['spending_prediction'] = scaler
        
        # Evaluate model
        score = model.score(X_test_scaled, y_test)
        logger.info(f"Spending prediction model R² score: {score:.4f}")
        
        return model, scaler
    
    def train_sentiment_analysis_model(self, data):
        """Train sentiment analysis model"""
        logger.info("Training sentiment analysis model...")
        
        # Simple TF-IDF based approach
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        
        # Prepare data
        X = data['text'].values
        y = data['sentiment'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Transform text data
        X_train_tfidf = vectorizer.fit_transform(X_train)
        X_test_tfidf = vectorizer.transform(X_test)
        
        # Train model
        model = MultinomialNB()
        model.fit(X_train_tfidf, y_train)
        
        # Save model and vectorizer
        self.models['sentiment_analysis'] = model
        self.scalers['sentiment_analysis'] = vectorizer
        
        # Evaluate model
        score = model.score(X_test_tfidf, y_test)
        logger.info(f"Sentiment analysis model accuracy: {score:.4f}")
        
        return model, vectorizer
    
    def train_anomaly_detection_model(self, data):
        """Train anomaly detection model"""
        logger.info("Training anomaly detection model...")
        
        # Use spending data for anomaly detection
        spending_values = data['spending'].values.reshape(-1, 1)
        
        # Train isolation forest
        model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        
        model.fit(spending_values)
        
        # Save model
        self.models['anomaly_detection'] = model
        
        logger.info("Anomaly detection model trained successfully")
        
        return model
    
    def save_models(self):
        """Save all trained models"""
        logger.info("Saving models...")
        
        for name, model in self.models.items():
            model_path = self.models_dir / f"{name}.joblib"
            joblib.dump(model, model_path)
            logger.info(f"Saved {name} model to {model_path}")
        
        for name, scaler in self.scalers.items():
            scaler_path = self.models_dir / f"{name}_scaler.joblib"
            joblib.dump(scaler, scaler_path)
            logger.info(f"Saved {name} scaler to {scaler_path}")
        
        # Save model metadata
        metadata = {
            'trained_at': datetime.now().isoformat(),
            'models': list(self.models.keys()),
            'scalers': list(self.scalers.keys()),
            'version': '1.0.0'
        }
        
        metadata_path = self.models_dir / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Saved model metadata to {metadata_path}")
    
    def load_models(self):
        """Load trained models"""
        logger.info("Loading models...")
        
        metadata_path = self.models_dir / 'metadata.json'
        if not metadata_path.exists():
            logger.warning("No model metadata found. Models may not be trained.")
            return
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        for model_name in metadata['models']:
            model_path = self.models_dir / f"{model_name}.joblib"
            if model_path.exists():
                self.models[model_name] = joblib.load(model_path)
                logger.info(f"Loaded {model_name} model")
        
        for scaler_name in metadata['scalers']:
            scaler_path = self.models_dir / f"{scaler_name}.joblib"
            if scaler_path.exists():
                self.scalers[scaler_name] = joblib.load(scaler_path)
                logger.info(f"Loaded {scaler_name} scaler")
    
    def train_all_models(self):
        """Train all ML models"""
        logger.info("Starting ML model training...")
        
        # Generate synthetic data
        data = self.generate_synthetic_data()
        
        # Train models
        self.train_fraud_detection_model(data['fraud'])
        self.train_spending_prediction_model(data['spending'])
        self.train_sentiment_analysis_model(data['sentiment'])
        self.train_anomaly_detection_model(data['spending'])
        
        # Save models
        self.save_models()
        
        logger.info("All models trained and saved successfully!")

def main():
    parser = argparse.ArgumentParser(description='Train FinGenius ML models')
    parser.add_argument('--models-dir', default='models', help='Directory to save models')
    parser.add_argument('--data-dir', default='data', help='Directory for data')
    parser.add_argument('--load-only', action='store_true', help='Only load existing models')
    
    args = parser.parse_args()
    
    # Create trainer
    trainer = FinGeniusMLTrainer(args.models_dir, args.data_dir)
    
    if args.load_only:
        trainer.load_models()
        logger.info("Models loaded successfully")
    else:
        trainer.train_all_models()

if __name__ == '__main__':
    main() 