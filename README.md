# AquaWatch AI 🌊

An intelligent, interactive satellite-data platform for real-time water pollution monitoring, built for AlgoOlympia 2026.

## Architecture

AquaWatch AI has evolved from a static dashboard into a fully dynamic analytics engine.
- **Frontend**: Next.js 14, TailwindCSS, React-Leaflet
- **Backend**: FastAPI, Google Earth Engine Python API, Pandas
- **No Database Needed**: All analytics, historical baseline computations, and satellite imagery exports are generated **on-the-fly** by pinging Google Earth Engine dynamically.

## Features
- **Global Interactive Map**: Click *anywhere* on a water body globally.
- **Dynamic Risk Engine**: Instantly computes 365-day NDWI baselines and compares them against current 7-day windows using Z-Score statistical anomaly detection.
- **Overlapping Image Slider**: Seamlessly scrub a slider to peel back real-time 2026 Sentinel-2 imagery and reveal the 2025 baseline underneath.
- **PDF Export**: Download professional reports natively.

## How to Run Locally

1. **Clone the Repo**
2. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   # Set up your Google Earth Engine service account credentials in a .env file!
   python -m uvicorn main:app --reload --port 8000
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open `http://localhost:3000` and click anywhere on the map!
