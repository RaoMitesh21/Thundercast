#!/usr/bin/env python3
"""
API script for windspeed prediction
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
        model_path = os.path.join(os.path.dirname(__file__), 'windspeed_model.joblib')
        model_data = joblib.load(model_path)
        
        model = model_data['model']
        scaler = model_data['scaler']
        feature_names = model_data['feature_names']
        
        # Prepare input array in correct order
        input_array = np.array([[input_data[feature] for feature in feature_names]])
        
        # Scale input
        input_scaled = scaler.transform(input_array)
        
        # Make prediction
        predicted_windspeed = model.predict(input_scaled)[0]
        
        # Determine wind category
        if predicted_windspeed < 5:
            wind_category = "Light"
            alert = f"Light winds: {predicted_windspeed:.1f} m/s - Calm conditions"
        elif predicted_windspeed < 10:
            wind_category = "Moderate"
            alert = f"Moderate winds: {predicted_windspeed:.1f} m/s - Normal conditions"
        elif predicted_windspeed < 15:
            wind_category = "Strong"
            alert = f"Strong winds: {predicted_windspeed:.1f} m/s - Be cautious"
        else:
            wind_category = "Very Strong"
            alert = f"Very strong winds: {predicted_windspeed:.1f} m/s - High wind warning"
        
        result = {
            'predicted_windspeed': float(predicted_windspeed),
            'wind_category': wind_category,
            'alert': alert,
            'model_info': {
                'type': 'Random Forest Regressor',
                'version': '1.0'
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'predicted_windspeed': 0.0,
            'wind_category': 'Error',
            'alert': f'Windspeed prediction failed: {str(e)}'
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
