import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import seaborn as sns
import joblib
import json
import os

df = pd.read_csv('wind_dataset.csv', index_col='DATE', parse_dates=True)

df['wind_lag_1'] = df['WIND'].shift(1)
df['wind_lag_2'] = df['WIND'].shift(2)
df['wind_lag_3'] = df['WIND'].shift(3)

df['ma_3'] = df['WIND'].rolling(3).mean()
df['ma_5'] = df['WIND'].rolling(5).mean()
df['ma_7'] = df['WIND'].rolling(7).mean()

df['std_3'] = df['WIND'].rolling(3).std()
df['std_5'] = df['WIND'].rolling(5).std()
df['std_7'] = df['WIND'].rolling(7).std()

df['wind_difference'] = df['WIND'].diff()
df['wind_shifted'] = df['WIND'].shift(-1)
df.dropna(inplace=True)
df
df.columns

scaler = StandardScaler()
X = df[['IND', 'RAIN', 'IND.1', 'T.MAX', 'IND.2', 'T.MIN.G', 'wind_lag_1', 'wind_lag_2', 'wind_lag_3','ma_3', 'ma_5', 'ma_7','std_3', 'std_5', 'std_7',]]
# X = df[[ 'RAIN',  'T.MAX', 'T.MIN.G', 'wind_lag_1', 'wind_lag_2', 'wind_lag_3',]]

X_scaled = scaler.fit_transform(X)
y = df['wind_shifted']
plt.figure(figsize=(20, 20))
##Normal X
# X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.76)
# X_train.shape[0], y_train.shape[0], X_test.shape[0], y_test.shape[0]

##Scaled X
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, train_size=0.76)
X_train.shape[0], y_train.shape[0], X_test.shape[0], y_test.shape[0]

model = RandomForestRegressor(n_estimators=60, max_depth=4, max_features=9)
model.fit(X_train, y_train)
importances = model.feature_importances_
feature_names = X.columns  # assuming X is a DataFrame

# Sort features by importance
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(10, 6))
plt.bar(range(len(importances)), importances[indices], align='center', edgecolor='k')
plt.xticks(range(len(importances)), feature_names[indices], rotation=45, ha='right')
plt.title("Feature Importance (Random Forest)")
plt.xlabel("Features")
plt.ylabel("Importance")
plt.tight_layout()
plt.show()
test_pred = model.predict(X_test)
train_pred = model.predict(X_train)
test_pred
print(mean_absolute_error(y_test, test_pred))
print(mean_absolute_error(y_train, train_pred))
df['WIND'].min()
df['WIND'].max()
plt.hist(y_test, bins=20)
plt.hist(test_pred, bins=20)

# At the end, add model saving and API creation
print("\nSaving windspeed model...")

# Save the trained model for backend use
model_save_path = 'windspeed_model.joblib'
info_save_path = 'windspeed_model_info.json'

try:
    # Save model with scaler and feature info
    model_data = {
        'model': model,
        'scaler': scaler,
        'feature_names': X.columns.tolist(),
        'performance': {
            'test_mae': float(mean_absolute_error(y_test, test_pred)),
            'train_mae': float(mean_absolute_error(y_train, train_pred)),
            'test_r2': float(r2_score(y_test, test_pred)),
            'train_r2': float(r2_score(y_train, train_pred))
        }
    }
    
    joblib.dump(model_data, model_save_path)
    print("✅ Windspeed model saved successfully!")
except Exception as e:
    print(f"❌ Error saving windspeed model: {e}")

# Save model info
feature_info = {
    'feature_columns': X.columns.tolist(),
    'feature_descriptions': {
        'IND': 'Weather Index 1',
        'RAIN': 'Rainfall (mm)',
        'IND.1': 'Weather Index 2', 
        'T.MAX': 'Maximum Temperature (°C)',
        'IND.2': 'Weather Index 3',
        'T.MIN.G': 'Minimum Ground Temperature (°C)',
        'wind_lag_1': 'Wind speed lag 1 day',
        'wind_lag_2': 'Wind speed lag 2 days',
        'wind_lag_3': 'Wind speed lag 3 days',
        'ma_3': '3-day moving average',
        'ma_5': '5-day moving average', 
        'ma_7': '7-day moving average',
        'std_3': '3-day standard deviation',
        'std_5': '5-day standard deviation',
        'std_7': '7-day standard deviation'
    },
    'model_type': 'RandomForestRegressor',
    'model_params': {
        'n_estimators': 60,
        'max_depth': 4,
        'max_features': 9
    },
    'performance': model_data['performance']
}

try:
    with open(info_save_path, 'w') as f:
        json.dump(feature_info, f, indent=2)
    print("✅ Windspeed model info saved successfully!")
except Exception as e:
    print(f"❌ Error saving windspeed model info: {e}")

# Create windspeed prediction API script
api_script = '''#!/usr/bin/env python3
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
'''

# Save windspeed API script
with open('windspeed_predict_api.py', 'w') as f:
    f.write(api_script)

# Make it executable
import stat
os.chmod('windspeed_predict_api.py', stat.S_IRWXU | stat.S_IRGRP | stat.S_IROTH)

print("✅ Windspeed API script created: windspeed_predict_api.py")

print(f"\nWindspeed model performance:")
print(f"Test MAE: {mean_absolute_error(y_test, test_pred):.4f}")
print(f"Train MAE: {mean_absolute_error(y_train, train_pred):.4f}")
print(f"Test R²: {r2_score(y_test, test_pred):.4f}")
print(f"Train R²: {r2_score(y_train, train_pred):.4f}")

print("\nFiles created:")
print("- windspeed_model.joblib (trained windspeed model)")
print("- windspeed_model_info.json (windspeed model metadata)")
print("- windspeed_predict_api.py (windspeed prediction API script)")