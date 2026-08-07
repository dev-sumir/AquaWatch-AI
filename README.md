# AquaWatch AI

## Problem
Water contamination and illegal land-cover change near waterways go undetected for long periods because monitoring depends on occasional citizen complaints or manual inspection.

## Solution
A web platform that pulls Sentinel-2 satellite imagery for a set of monitored sites, computes water/vegetation health indices over time, detects statistically significant deviations, and presents each site's status as a map pin with a risk score.

## How It Works
- Sentinel-2 imagery is queried and processed via Google Earth Engine.
- NDWI and NDVI are calculated and compared to historical baselines to produce anomaly risk scores.
- Data is stored in Postgres and served via a FastAPI backend.
- A Next.js frontend displays the results on an interactive map and detailed site dashboard.

## Tech Stack
- Frontend: Next.js, Tailwind CSS, React-Leaflet / Mapbox
- Backend: FastAPI, SQLAlchemy, PostgreSQL
- AI/Data: Google Earth Engine, Pandas, Numpy

## Live Demo
- Frontend: [URL]
- Backend API docs: [URL]/docs

## Screenshots
*(Add screenshots here)*

## Team
- Dev A (Backend Lead)
- Dev B (AI/Data Lead)
- Dev C (Frontend Lead)
- Dev D (Frontend/Integration + Demo Lead)

## Data Sources
- Sentinel-2 Level-2A surface reflectance imagery (via Google Earth Engine)

## Running Locally
**(Add instructions)**

## What We'd Build Next
- Expand to more indices (e.g., chlorophyll, suspended matter).
- Allow user-defined AOIs.
- Continuous model training and evaluation.
