#!/usr/bin/env python3
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
