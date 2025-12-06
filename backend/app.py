from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import numpy as np
from datetime import datetime
import joblib

# Add the Model directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Model'))

predictor = None
model_loaded = False
windspeed_model_data = None
windspeed_model_loaded = False

# Replace Thunderstorm model loading to use joblib created by thunder_prediction_model.py
ts_model_data = None
ts_model_loaded = False
try:
    ts_model_path = os.path.join(os.path.dirname(__file__), '..', 'Model', 'thunderstorm_model.joblib')
    if os.path.exists(ts_model_path):
        ts_model_data = joblib.load(ts_model_path)  # contains: model, scaler, feature_names
        ts_model_loaded = True
        print("✅ Thunderstorm joblib model loaded")
    else:
        print(f"⚠️ Thunderstorm model not found at: {ts_model_path}")
        ts_model_loaded = False
except Exception as e:
    print(f"❌ Error loading thunderstorm joblib model: {e}")
    ts_model_loaded = False

# Ensure public flags reflect actual thunderstorm model state
model_loaded = ts_model_loaded

# Load windspeed model
try:
    windspeed_model_path = os.path.join(os.path.dirname(__file__), '..', 'Model', 'windspeed_model.joblib')
    if os.path.exists(windspeed_model_path):
        windspeed_model_data = joblib.load(windspeed_model_path)
        print("✅ Windspeed model loaded successfully!")
        windspeed_model_loaded = True
    else:
        print("⚠️ Windspeed model file not found")
        windspeed_model_loaded = False
except Exception as e:
    print(f"❌ Error during model loading: {e}")

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "Hackovate Weather Prediction API",
        "models": {
            "thunderstorm": ts_model_loaded,  # was model_loaded
            "windspeed": windspeed_model_loaded
        },
        "endpoints": {
            "thunderstorm_predict": "/api/ml/predict",
            "windspeed_predict": "/api/windspeed/predict",
            "health": "/api/health"
        }
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "OK",
        "thunderstorm_model": ts_model_loaded,  # was model_loaded
        "windspeed_model": windspeed_model_loaded,
        "timestamp": datetime.now().isoformat()
    })

def predict_thunder_with_joblib(payload: dict):
    """Predict using joblib model (no randomness)."""
    if not ts_model_loaded or ts_model_data is None:
        raise RuntimeError("Thunderstorm model not loaded")

    model = ts_model_data['model']
    scaler = ts_model_data['scaler']
    feature_names = ts_model_data['feature_names']

    # Validate required features
    missing = [f for f in feature_names if f not in payload]
    if missing:
        return None, {
            "success": False,
            "error": f"Missing parameters: {missing}"
        }, 400

    # Prepare and scale
    X = np.array([[payload[f] for f in feature_names]])
    Xs = scaler.transform(X)

    # Predict
    proba = model.predict_proba(Xs)[0]
    p_thunder = float(proba[1] if len(proba) > 1 else proba[0])
    pred = int(1 if p_thunder >= 0.5 else 0)
    confidence = float(max(proba) * 100.0)

    # Risk mapping (deterministic)
    if p_thunder >= 0.75:
        risk = "Red"
        alert = f"SEVERE: {p_thunder*100:.1f}% thunderstorm probability"
    elif p_thunder >= 0.50:
        risk = "Yellow"
        alert = f"MODERATE: {p_thunder*100:.1f}% thunderstorm probability"
    elif p_thunder >= 0.25:
        risk = "Yellow"
        alert = f"LOW-MODERATE: {p_thunder*100:.1f}% thunderstorm risk"
    else:
        risk = "Green"
        alert = f"LOW: {p_thunder*100:.1f}% thunderstorm risk"

    result = {
        "prediction": pred,
        "probability": p_thunder,
        "confidence": confidence,
        "risk_level": risk,
        "riskLevel": risk,
        "alert": alert,
        "modelType": "RandomForestClassifier (CSV-trained)"
    }
    return result, None, 200

# Update the thunderstorm predict route to use the joblib model and avoid any random fallback
@app.route('/api/ml/predict', methods=['POST'])
def predict_thunderstorm():
    try:
        data = request.get_json() or {}

        if not ts_model_loaded:
            return jsonify({
                "success": False,
                "error": "Thunderstorm model not loaded. Train and save thunderstorm_model.joblib."
            }), 503

        result, err, code = predict_thunder_with_joblib(data)
        if err:
            return jsonify(err), code

        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Also use the model for location-based prediction (deterministic)
@app.route('/api/ml/predict/<location_id>')
def predict_thunderstorm_for_location(location_id):
    try:
        if not ts_model_loaded:
            return jsonify({
                "success": False,
                "error": "Thunderstorm model not loaded. Train and save thunderstorm_model.joblib.",
                "locationId": location_id
            }), 503

        # Provide a sensible default mock input then predict with model (no randomness)
        mock = {
            'wind_sfc_speed_ms': 10, 'wind_sfc_dir_deg': 180,
            'wind_500_speed_ms': 15, 'wind_500_dir_deg': 180,
            'temp_2m_C': 20, 'temp_500_C': -5,
            'rh_2m_pct': 60, 'pressure_sfc_hPa': 1013,
            'precipitable_water_mm': 25, 'cloud_cover_frac': 0.5,
            'cloud_top_temp_C': -20, 'CAPE_Jkg': 1000,
            'Lifted_Index_C': 0, 'K_index': 25, 'shear_850_500_ms': 10
        }
        result, err, code = predict_thunder_with_joblib(mock)
        if err:
            return jsonify(err), code

        return jsonify({
            "success": True,
            "data": {**result, "locationId": location_id, "weather_data": mock}
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "locationId": location_id
        }), 500

@app.route('/api/windspeed/predict', methods=['POST'])
def predict_windspeed():
    try:
        data = request.get_json()

        # Your windspeed parameters
        required_params = [
            'IND', 'RAIN', 'IND.1', 'T.MAX', 'IND.2', 'T.MIN.G',
            'wind_lag_1', 'wind_lag_2', 'wind_lag_3',
            'ma_3', 'ma_5', 'ma_7',
            'std_3', 'std_5', 'std_7'
        ]

        missing_params = [param for param in required_params if param not in data]
        if missing_params:
            return jsonify({
                "success": False,
                "error": f"Missing windspeed parameters: {missing_params}"
            }), 400

        if windspeed_model_loaded:
            model = windspeed_model_data['model']
            scaler = windspeed_model_data['scaler']
            feature_names = windspeed_model_data['feature_names']

            input_array = np.array([[data[feature] for feature in feature_names]])
            input_scaled = scaler.transform(input_array)
            predicted_windspeed = model.predict(input_scaled)[0]

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
                'modelType': 'Random Forest Regressor (Trained)'
            }
        else:
            result = fallback_windspeed_prediction(data)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/windspeed/predict/<location_id>')
def predict_windspeed_for_location(location_id):
    try:
        location_windspeed_data = {
            'IND': 1.2, 'RAIN': 0.5, 'IND.1': 0.8, 'T.MAX': 25.0, 'IND.2': 1.1, 'T.MIN.G': 15.0,
            'wind_lag_1': 8.5, 'wind_lag_2': 7.2, 'wind_lag_3': 9.1,
            'ma_3': 8.3, 'ma_5': 8.1, 'ma_7': 7.9,
            'std_3': 1.2, 'std_5': 1.5, 'std_7': 1.8
        }

        if windspeed_model_loaded:
            model = windspeed_model_data['model']
            scaler = windspeed_model_data['scaler']
            feature_names = windspeed_model_data['feature_names']

            input_array = np.array([[location_windspeed_data[feature] for feature in feature_names]])
            input_scaled = scaler.transform(input_array)
            predicted_windspeed = model.predict(input_scaled)[0]

            if predicted_windspeed < 5:
                wind_category = "Light"
            elif predicted_windspeed < 10:
                wind_category = "Moderate"
            elif predicted_windspeed < 15:
                wind_category = "Strong"
            else:
                wind_category = "Very Strong"

            result = {
                'predicted_windspeed': float(predicted_windspeed),
                'wind_category': wind_category,
                'alert': f"{wind_category} winds: {predicted_windspeed:.1f} m/s",
                'locationId': location_id
            }
        else:
            result = fallback_windspeed_prediction(location_windspeed_data)
            result['locationId'] = location_id

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "locationId": location_id
        }), 500

def fallback_windspeed_prediction(parameters):
    """Fallback windspeed prediction when model is not available"""
    base_windspeed = 8.0
    temp_factor = parameters.get('T.MAX', 20) / 20
    wind_lag_avg = (parameters.get('wind_lag_1', 8) + parameters.get('wind_lag_2', 8) + parameters.get('wind_lag_3', 8)) / 3

    predicted_windspeed = base_windspeed * temp_factor * 0.3 + wind_lag_avg * 0.7
    predicted_windspeed = max(0, min(25, predicted_windspeed))

    if predicted_windspeed < 5:
        wind_category = "Light"
    elif predicted_windspeed < 10:
        wind_category = "Moderate"
    elif predicted_windspeed < 15:
        wind_category = "Strong"
    else:
        wind_category = "Very Strong"

    return {
        'predicted_windspeed': float(predicted_windspeed),
        'wind_category': wind_category,
        'alert': f"{wind_category} winds: {predicted_windspeed:.1f} m/s",
        'modelType': 'Fallback Windspeed Model'
    }

if __name__ == '__main__':
    print("🚀 Starting Hackovate Weather Prediction API...")
    if not ts_model_loaded:
        print("⚠️ Thunderstorm model not loaded; thunderstorm API will return 503")
    if not windspeed_model_loaded:
        print("⚠️ Windspeed model not loaded, using fallback")
    print("🌐 Server starting on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
    print("🌐 Server starting on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
