<div align="center">

  <img src="frontend/src/logo/logo.png" alt="Thundercast Logo" width="140" />

  <h1>Thundercast</h1>

  <p>AI-powered Thunderstorm and Gale Prediction Platform</p>

  <p>
  <a href="https://github.com/RaoMitesh21/Thundercast.git"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Thundercast-181717?logo=github" /></a>
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
    <img alt="Built with" src="https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Python-blue" />
    <img alt="Status" src="https://img.shields.io/badge/Status-Active-success" />
  </p>
</div>

## Overview

Thundercast combines machine learning models with real-time weather data to forecast thunderstorm and gale risks. The platform provides an interactive globe/map UI, live station stats, and actionable alerts for quick decision-making.

Key capabilities:
- ML-driven predictions for thunderstorms and windspeed/gales
- Real-time weather data aggregation
- Interactive 3D globe and map views with layers
- Configurable alerts and visualization panels

## Project Structure

The repo is organized as a monorepo with separate frontend and backend:
- `frontend/` React app (Tailwind CSS) with globe/map UI
- `backend/` Node.js + Python services for APIs and ML inference
- `Model/` Python training scripts and serialized models
- `docs/` Reports and technical documentation

## Screenshots

> Add screenshots or short GIFs demonstrating the globe view, alerts, and prediction panels.

- Globe view: `frontend/README_GLOBE.md`
- UI components: `frontend/src/components/*`

## Quick Start (macOS / zsh)

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip (or venv/conda)

### 1) Backend Setup

The backend includes a Node.js server (`backend/server.js`) and Python ML services.

```zsh
# From repo root
cd backend

# Install Node dependencies
npm install

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start the Node server (serves REST endpoints)
npm start
# or
# node server.js

# In a separate terminal, run Python APIs (if needed)
# python app.py
```

Common backend files:
- `routes/*.js` API routes for locations, weather, and ML predictions
- `services/*.js` service layer for ML and weather data
- `thunderstorm_model.pkl` serialized model used by Python scripts
- `requirements.txt` Python dependencies

### 2) Frontend Setup

```zsh
# From repo root
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

Open http://localhost:3000 in your browser. Ensure the backend is running for API calls.

## Configuration

Environment variables typically used by the backend and frontend (examples, adapt to your deployment):

Backend (`backend/.env`):
- `PORT=5000`
- `WEATHER_API_KEY=your_key`
- `ML_MODEL_PATH=thunderstorm_model.pkl`

Frontend (`frontend/.env`):
- `REACT_APP_API_BASE=http://localhost:5000`

Check `frontend/src/services/*` and `backend/services/*` for the exact variable usage.

## API Endpoints

Node backend routes (see `backend/routes/`):
- `GET /weather` Current weather data
- `GET /locations` Available locations/stations
- `POST /ml/predict` Thunderstorm/gale prediction with input features

Python APIs (see `Model/*_predict_api.py` and `backend/app.py`):
- Windspeed/Thunderstorm prediction endpoints for model-serving

## Machine Learning Models

Training and inference artifacts live under `Model/`:
- `thunderstorm_prediction_model.py`, `windspeed_prediction_model.py`
- Saved models: `thunderstorm_model.joblib`, `windspeed_model.joblib`
- Evaluation visuals: `roc_curve.png`, `confusion_matrix.png`, `feature_importance.png`
- Example datasets: `thunderstorm_sample_dataset.csv`, `wind_dataset.csv`

For local experimentation:
```zsh
cd Model
python run_model.py
```

## Architecture (High-level)

- React frontend consumes backend REST endpoints for weather and predictions
- Node.js server orchestrates requests and optionally invokes Python ML services
- Python scripts handle training and model inference, persisting artifacts to `Model/`

## Contributing

Contributions are welcome! Please:
- Open an issue describing the change
- Create a PR with a clear description and testing notes
- Keep code style consistent with existing conventions

## License

MIT License. See `LICENSE` if present.

## Acknowledgements

- Team TheAIDominators for the vision and implementation
- Open weather APIs and the OSS community

---

Tip: If the logo path doesn’t render on some platforms, switch the `img src` to an absolute GitHub URL pointing at the file in this repo.
