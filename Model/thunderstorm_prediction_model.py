import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, classification_report, roc_curve, auc, precision_recall_curve, confusion_matrix, ConfusionMatrixDisplay
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

# Load and prepare data
df = pd.read_csv('thunderstorm_sample_dataset.csv', index_col='time_utc', parse_dates=True)
print("Dataset columns:", df.columns.tolist())
print("Dataset shape:", df.shape)

# Define features
feature_columns = ['wind_sfc_speed_ms',
       'wind_sfc_dir_deg', 'wind_500_speed_ms', 'wind_500_dir_deg',
       'temp_2m_C', 'temp_500_C', 'rh_2m_pct', 'pressure_sfc_hPa',
       'precipitable_water_mm', 'cloud_cover_frac', 'cloud_top_temp_C',
       'CAPE_Jkg', 'Lifted_Index_C', 'K_index', 'shear_850_500_ms']

X = df[feature_columns]
y = df['thunder_label']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.09, random_state=42)
print(f"Training samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

# Train model
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, max_depth=4, max_features=6, criterion='log_loss', random_state=42)
model.fit(X_train, y_train)

# Make predictions
y_train_prob = model.predict_proba(X_train)
y_test_prob = model.predict_proba(X_test)
train_prob = model.predict_proba(X_train)
test_prob = model.predict_proba(X_test)

# Calculate ROC curves
fpr_train, tpr_train, _ = roc_curve(y_train, train_prob[:, 1])
fpr_test, tpr_test, _ = roc_curve(y_test, test_prob[:, 1])
roc_auc_test = auc(fpr_test, tpr_test)
roc_auc_train = auc(fpr_train, tpr_train)

print(f"Training AUC: {roc_auc_train:.4f}")
print(f"Test AUC: {roc_auc_test:.4f}")

# Plot ROC Curve
plt.figure(figsize=(10, 6))
plt.plot(fpr_train, tpr_train, linewidth=2, label=f'Train (AUC = {roc_auc_train:.4f})')
plt.plot(fpr_test, tpr_test, linewidth=2, label=f'Test (AUC = {roc_auc_test:.4f})')
plt.plot([0, 1], [0, 1], color='red', linestyle='--', label='Random Guess')
plt.title('ROC Curve - Thunderstorm Prediction Model')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(loc='lower right')
plt.grid(True)
plt.tight_layout()
plt.savefig('roc_curve.png', dpi=300, bbox_inches='tight')
plt.show()

# Generate predictions
train_pred = model.predict(X_train)
test_pred = model.predict(X_test)

# Confusion Matrix
cf = confusion_matrix(y_test, test_pred)
plt.figure(figsize=(8, 6))
ConfusionMatrixDisplay(cf).plot()
plt.title('Confusion Matrix - Test Set')
plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()

# Classification Report
cr = classification_report(y_test, test_pred)
print("Classification Report:")
print(cr)

# Probability Distribution
plt.figure(figsize=(10, 6))
plt.hist(test_prob[:, 1], edgecolor='b', bins=40, alpha=0.7)
plt.title('Distribution of Thunderstorm Probabilities - Test Set')
plt.xlabel('Probability')
plt.ylabel('Frequency')
plt.grid(True, alpha=0.3)
plt.savefig('probability_distribution.png', dpi=300, bbox_inches='tight')
plt.show()

# Feature Importance
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nFeature Importance:")
print(feature_importance)

plt.figure(figsize=(12, 8))
plt.barh(feature_importance['feature'], feature_importance['importance'])
plt.title('Feature Importance - Thunderstorm Prediction Model')
plt.xlabel('Importance')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
plt.show()

# Save the trained model for backend use - FIXED PATHS
model_save_path = 'thunderstorm_model.joblib'  # Save in current directory
info_save_path = 'model_info.json'

print(f"\nSaving model to: {model_save_path}")
try:
    # Save model with scaler and feature info
    model_data = {
        'model': model,
        'scaler': StandardScaler().fit(X_train),  # Fit scaler on training data
        'feature_names': feature_columns,
        'performance': {
            'train_auc': float(roc_auc_train),
            'test_auc': float(roc_auc_test),
            'train_accuracy': float(accuracy_score(y_train, train_pred)),
            'test_accuracy': float(accuracy_score(y_test, test_pred))
        }
    }
    
    joblib.dump(model_data, model_save_path)
    print("✅ Model saved successfully!")
except Exception as e:
    print(f"❌ Error saving model: {e}")

# Save model info with additional metadata for frontend
feature_info = {
    'feature_columns': feature_columns,
    'feature_descriptions': {
        'wind_sfc_speed_ms': 'Surface wind speed (m/s)',
        'wind_sfc_dir_deg': 'Surface wind direction (degrees)',
        'wind_500_speed_ms': '500mb wind speed (m/s)',
        'wind_500_dir_deg': '500mb wind direction (degrees)',
        'temp_2m_C': '2m temperature (°C)',
        'temp_500_C': '500mb temperature (°C)',
        'rh_2m_pct': '2m relative humidity (%)',
        'pressure_sfc_hPa': 'Surface pressure (hPa)',
        'precipitable_water_mm': 'Precipitable water (mm)',
        'cloud_cover_frac': 'Cloud cover fraction (0-1)',
        'cloud_top_temp_C': 'Cloud top temperature (°C)',
        'CAPE_Jkg': 'CAPE (J/kg)',
        'Lifted_Index_C': 'Lifted Index (°C)',
        'K_index': 'K Index',
        'shear_850_500_ms': 'Wind shear 850-500mb (m/s)'
    },
    'default_values': {
        'wind_sfc_speed_ms': 10,
        'wind_sfc_dir_deg': 180,
        'wind_500_speed_ms': 15,
        'wind_500_dir_deg': 180,
        'temp_2m_C': 20,
        'temp_500_C': -5,
        'rh_2m_pct': 60,
        'pressure_sfc_hPa': 1013,
        'precipitable_water_mm': 25,
        'cloud_cover_frac': 0.5,
        'cloud_top_temp_C': -20,
        'CAPE_Jkg': 1000,
        'Lifted_Index_C': 0,
        'K_index': 25,
        'shear_850_500_ms': 10
    },
    'model_type': 'RandomForestClassifier',
    'model_params': {
        'n_estimators': 100,
        'max_depth': 4,
        'max_features': 6,
        'criterion': 'log_loss',
        'random_state': 42
    },
    'performance': {
        'train_auc': float(roc_auc_train),
        'test_auc': float(roc_auc_test),
        'train_accuracy': float(accuracy_score(y_train, train_pred)),
        'test_accuracy': float(accuracy_score(y_test, test_pred))
    }
}

try:
    with open(info_save_path, 'w') as f:
        json.dump(feature_info, f, indent=2)
    print("✅ Model info saved successfully!")
except Exception as e:
    print(f"❌ Error saving model info: {e}")

print("Model and feature information saved successfully!")
print(f"Model performance - Test Accuracy: {feature_info['performance']['test_accuracy']:.4f}")
print(f"Model performance - Test AUC: {feature_info['performance']['test_auc']:.4f}")

# Create a simple prediction API script
api_script = '''#!/usr/bin/env python3
"""
API script for thunderstorm prediction
Reads JSON from stdin and outputs prediction results
"""

import sys
import json
import numpy as np
import joblib
import os

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Load model
        model_path = os.path.join(os.path.dirname(__file__), 'thunderstorm_model.joblib')
        model_data = joblib.load(model_path)
        
        model = model_data['model']
        scaler = model_data['scaler']
        feature_names = model_data['feature_names']
        
        # Prepare input array in correct order
        input_array = np.array([[input_data[feature] for feature in feature_names]])
        
        # Scale input
        input_scaled = scaler.transform(input_array)
        
        # Make prediction
        prediction_binary = model.predict(input_scaled)[0]
        prediction_proba = model.predict_proba(input_scaled)[0]
        
        # Get probability of thunderstorm (class 1)
        thunderstorm_probability = prediction_proba[1] if len(prediction_proba) > 1 else prediction_proba[0]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Determine risk level
        if thunderstorm_probability >= 0.75:
            risk_level = "Red"
            alert = f"SEVERE: {thunderstorm_probability*100:.1f}% thunderstorm probability"
        elif thunderstorm_probability >= 0.50:
            risk_level = "Yellow"
            alert = f"MODERATE: {thunderstorm_probability*100:.1f}% thunderstorm probability"
        elif thunderstorm_probability >= 0.25:
            risk_level = "Yellow"
            alert = f"LOW-MODERATE: {thunderstorm_probability*100:.1f}% thunderstorm risk"
        else:
            risk_level = "Green"
            alert = f"LOW: {thunderstorm_probability*100:.1f}% thunderstorm risk"
        
        result = {
            'prediction': int(prediction_binary),
            'probability': float(thunderstorm_probability),
            'confidence': float(confidence),
            'risk_level': risk_level,
            'riskLevel': risk_level,
            'alert': alert,
            'model_info': {
                'type': 'Random Forest Classifier',
                'version': '1.0'
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'prediction': 0,
            'probability': 0.0,
            'confidence': 0.0,
            'risk_level': 'Error',
            'alert': f'Prediction failed: {str(e)}'
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
'''

# Save API script
with open('predict_api.py', 'w') as f:
    f.write(api_script)

# Make it executable
import stat
os.chmod('predict_api.py', stat.S_IRWXU | stat.S_IRGRP | stat.S_IROTH)

print("✅ API script created: predict_api.py")

print("\nModel training and saving completed successfully!")
print("Files created:")
print("- thunderstorm_model.joblib (trained model)")
print("- model_info.json (model metadata)")
print("- roc_curve.png (ROC curve plot)")
print("- confusion_matrix.png (confusion matrix)")
print("- probability_distribution.png (probability histogram)")
print("- feature_importance.png (feature importance plot)")
print("- predict_api.py (prediction API script)")