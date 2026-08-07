# AquaWatch AI — 12-Hour Implementation Blueprint
**Theme:** Planet Reboot: Climate Tech and Environmental Sustainability
**Team Size:** 4 Developers | **Duration:** 12 Hours | **Type:** Software-only

---

## 1. Project Overview

**Project Name:** AquaWatch AI

**Elevator Pitch:** AquaWatch AI turns free satellite data into a continuous water-body health monitor — detecting contamination and land-cover anomalies in days instead of the months it currently takes for someone to notice.

**Problem Statement:** Water contamination and illegal land-cover change near waterways go undetected for long periods because monitoring depends on occasional citizen complaints or manual inspection. There is no automated, continuous way to flag when a water body's condition changes significantly.

**Proposed Solution:** A web platform that pulls Sentinel-2 satellite imagery for a set of monitored sites, computes water/vegetation health indices (NDWI, NDVI) over time, detects statistically significant deviations from each site's baseline, and presents each site's status as a map pin with a risk score, before/after imagery, a time-series chart, and a plain-language verdict.

**Target Users:** Environmental regulators/agencies, NGOs, ESG/environmental auditors, and community watchdog groups (for the hackathon demo, we present it through the lens of a regulator/auditor dashboard).

**Environmental Impact:** Compresses the time between environmental damage occurring and someone noticing it — the gap where most preventable, cumulative damage (contamination spread, deforestation expansion) accumulates. Earlier detection enables earlier remediation.

**Innovation:** Not another satellite-imagery viewer — the differentiator is converting raw spectral index data into a decision-ready risk score and plain-language verdict, backed by a real, queryable database of site history, not a one-off script.

**Expected Outcomes:** A working, demoable, end-to-end pipeline (real satellite data → real DB → real API → real frontend) covering 3–5 verified real-world sites, deployed and accessible via a public URL.

---

## 2. Product Requirements Document (PRD)

**Vision:** Make environmental change-detection as easy to check as checking the weather.

**Goals (for the hackathon):**
1. Demonstrate a real, working data pipeline from satellite source → database → API → UI.
2. Show at least one site with a genuine, verifiable historical anomaly (not synthetic data).
3. Present results in a way a non-technical judge immediately understands.

**Success Metrics:**
- All 3–5 sites load correctly with real computed index values.
- At least 1 site clearly shows a flagged anomaly with a defensible before/after visual.
- End-to-end demo runs with zero live external API calls (backend serves from DB).
- Full stack deployed and reachable via URL before submission deadline.

**Functional Requirements:**
- List and display monitored sites on a map.
- Display per-site time-series of NDWI/NDVI.
- Compute and display an anomaly/risk score per site.
- Display a plain-language verdict per site.
- Display before/after satellite image thumbnails per site.

**Non-Functional Requirements:**
- Demo must work offline from live satellite APIs (data pre-fetched into DB).
- Page load under 2 seconds using cached/precomputed data.
- Mobile-responsive (judges may view on phones).

**Constraints:** 12 hours, 4 people, laptops only, no auth required, must use only free-tier APIs/data.

**Assumptions:** Team pre-selects 3–5 real, verifiable sites *before* the clock starts (see Section 9). Google Earth Engine account is registered in advance (approval can take time — do this days before the event).

---

## 3. Software Requirements Specification (SRS)

**User Roles:** Single role — Viewer (no auth, no admin UI needed; data is seeded via backend scripts, not a live admin panel).

**System Requirements:** Modern browser, internet connection (for map tiles); no installs needed for end user.

**Functional Modules:**
1. Site Registry Module (list/detail of monitored sites)
2. Time-Series Module (historical index values per site)
3. Anomaly Scoring Module (risk score + severity + verdict)
4. Visualization Module (map, charts, before/after imagery)

**Inputs:** Site AOI (area of interest) coordinates, Sentinel-2 imagery date ranges (set during data pipeline phase, not by end user at runtime).

**Outputs:** Site list, per-site risk score (0–100), severity label (Low/Moderate/High), time-series chart data, before/after image URLs, plain-language verdict string.

**Business Logic:** Anomaly score = z-score of current-period mean index vs. baseline-period mean/std, mapped to a 0–100 scale and a severity bucket. See Section 10 for exact formula.

**Validation Rules:** Sites without sufficient cloud-free imagery in a period are marked `insufficient_data` rather than given a false score.

---

## 4. Complete Feature Breakdown

### Feature 1: Site Map & List
- **Objective:** Let a user see all monitored sites at a glance.
- **Why it exists:** Entry point of the demo; establishes geographic credibility.
- **User Flow:** User lands on homepage → sees map with pins colored by severity → clicks a pin → routed to site detail.
- **Backend Logic:** `GET /api/sites` returns all sites with latest score + severity.
- **Frontend Components:** `<MapView />`, `<SiteMarker />`, `<SiteListSidebar />`.
- **AI Logic:** None (display only).
- **Database Tables:** `sites`, `anomaly_scores` (latest row per site).
- **APIs Used:** Internal backend API; Mapbox/Leaflet tiles.
- **Libraries:** Mapbox GL JS or React-Leaflet.
- **Inputs:** None (page load).
- **Outputs:** Rendered map with pins.
- **Error Handling:** If API fails, show cached fallback JSON bundled in frontend build.
- **Edge Cases:** Site with no score yet → gray pin, "Pending" label.
- **Dependencies:** Backend API must be live first.
- **Est. Dev Time:** 2 hours.
- **Priority:** Must Have.

### Feature 2: Site Detail Panel
- **Objective:** Show full picture for one site.
- **Why it exists:** This is where the "wow" happens in the demo.
- **User Flow:** Click pin/list item → panel/page opens with score, chart, images, verdict.
- **Backend Logic:** `GET /api/sites/{id}`, `GET /api/sites/{id}/timeseries`.
- **Frontend Components:** `<SiteDetail />`, `<RiskGauge />`, `<TimeSeriesChart />`, `<BeforeAfterImages />`, `<VerdictCard />`.
- **AI Logic:** Consumes precomputed anomaly score (computed offline, Section 10).
- **Database Tables:** `sites`, `observations`, `anomaly_scores`.
- **APIs Used:** Internal backend API.
- **Libraries:** Recharts (chart), plain `<img>` for thumbnails.
- **Inputs:** `site_id` route param.
- **Outputs:** Full site detail view.
- **Error Handling:** Missing image → placeholder "imagery unavailable for this date."
- **Edge Cases:** Site with `insufficient_data` status → show explanatory message instead of a score.
- **Dependencies:** Feature 1 (navigation), backend endpoints live.
- **Est. Dev Time:** 3 hours.
- **Priority:** Must Have.

### Feature 3: Anomaly Scoring Pipeline
- **Objective:** Produce the actual risk score per site.
- **Why it exists:** This is the AI/analytical core of the project — without it, this is just a map.
- **User Flow:** N/A (offline pipeline, run by team before/during hackathon, not user-triggered).
- **Backend Logic:** Python script pulls GEE data → computes NDWI/NDVI per available date → computes baseline stats → computes z-score → writes to `observations` and `anomaly_scores` tables via direct DB write or seed endpoint.
- **Frontend Components:** None directly (consumed by Feature 2).
- **AI Logic:** Statistical anomaly detection (z-score); optional stretch: Isolation Forest across multiple indices jointly.
- **Database Tables:** `observations`, `anomaly_scores`.
- **APIs Used:** Google Earth Engine Python API.
- **Libraries:** `earthengine-api`, `numpy`, `pandas`.
- **Inputs:** Site AOI polygon/point, date range.
- **Outputs:** NDWI/NDVI values per date, anomaly score, severity, verdict text.
- **Error Handling:** Skip dates with >40% cloud cover; log and continue.
- **Edge Cases:** Site with genuinely no anomaly → score near baseline, verdict = "No significant change detected."
- **Dependencies:** GEE account approved and authenticated (must be done pre-hackathon).
- **Est. Dev Time:** 3–4 hours.
- **Priority:** Must Have.

### Feature 4: Before/After Image Export
- **Objective:** Visual proof to accompany the score.
- **Why it exists:** Judges trust what they can see, not just a number.
- **User Flow:** Displayed inside Site Detail Panel.
- **Backend Logic:** GEE export of true-color composite for baseline period and current period, saved as static image files, served via backend static route or object storage.
- **Frontend Components:** `<BeforeAfterImages />` (side-by-side or slider).
- **AI Logic:** None (raw export, not model output).
- **Database Tables:** `observations` (image URL column) or a dedicated `site_images` table.
- **APIs Used:** Google Earth Engine (export/thumbnail URL generation).
- **Libraries:** `earthengine-api`.
- **Inputs:** AOI, date.
- **Outputs:** PNG/JPEG image URLs.
- **Error Handling:** If export fails, fall back to GEE's `getThumbURL` (faster, lower quality, still works).
- **Edge Cases:** Persistent cloud cover blocking a clean image — pick nearest clear date within ±10 days.
- **Dependencies:** Feature 3 pipeline running first (same script can produce both).
- **Est. Dev Time:** Included in Feature 3 estimate (build together).
- **Priority:** Must Have.

### Feature 5: Plain-Language Verdict Generator
- **Objective:** Translate a numeric score into a sentence a non-technical judge understands instantly.
- **Why it exists:** Differentiator vs. "just a dashboard."
- **User Flow:** Displayed in `<VerdictCard />`.
- **Backend Logic:** Rule-based template selection based on severity bucket + which index moved (e.g., "Water clarity dropped {X}% — consistent with a contamination event.").
- **Frontend Components:** `<VerdictCard />`.
- **AI Logic:** Simple templated NLG (rule-based, not an LLM call — keeps it deterministic and demo-safe).
- **Database Tables:** `anomaly_scores.verdict_text` (precomputed and stored, not generated at request time).
- **APIs Used:** None at runtime.
- **Libraries:** None (Python string templates).
- **Inputs:** Severity bucket, index delta, index name.
- **Outputs:** Verdict string.
- **Error Handling:** Default generic template if no rule matches.
- **Edge Cases:** Multiple indices anomalous at once → combine into one sentence, prioritized by magnitude.
- **Dependencies:** Feature 3.
- **Est. Dev Time:** 1 hour.
- **Priority:** Must Have.

### Feature 6: Risk Score Gauge/Visual
- **Objective:** Instant visual read of severity.
- **Why it exists:** Demo pacing — judges shouldn't have to read to understand severity.
- **User Flow:** Part of Site Detail Panel.
- **Backend Logic:** None (frontend renders based on score value).
- **Frontend Components:** `<RiskGauge />` (colored arc/bar, 0–100).
- **AI Logic:** None.
- **Database Tables:** Reads `anomaly_scores.score`.
- **Libraries:** Simple SVG or a lightweight gauge component.
- **Inputs:** Score (0–100).
- **Outputs:** Colored gauge (green/yellow/red).
- **Error Handling:** N/A.
- **Edge Cases:** `insufficient_data` → gray "N/A" state instead of a gauge.
- **Dependencies:** Feature 2.
- **Est. Dev Time:** 1 hour.
- **Priority:** Should Have.

### Feature 7: Site Comparison View
- **Objective:** Let judges see a healthy site vs. a flagged site side by side.
- **Why it exists:** Strengthens credibility — shows the model doesn't just flag everything.
- **User Flow:** Optional toggle on homepage: "Compare sites."
- **Backend Logic:** `GET /api/sites?compare=id1,id2`.
- **Frontend Components:** `<CompareView />`.
- **Database Tables:** Same as Feature 1/2.
- **Est. Dev Time:** 1.5 hours.
- **Priority:** Nice to Have (only build if ahead of schedule).

### Feature 8: PDF/Export Report
- **Objective:** Show the "B2B artifact" a real auditor would use.
- **Why it exists:** Elevates from demo to product in judges' eyes.
- **Est. Dev Time:** 1.5 hours.
- **Priority:** Nice to Have — only attempt after all Must Haves are done and tested.

---

## 5. UI/UX Planning

### Page 1: Homepage / Map Dashboard
- **Purpose:** Entry point, geographic overview.
- **Layout:** Full-width map (left/center 70%), site list sidebar (right 30%), header with project name + tagline.
- **Components:** `<MapView />`, `<SiteListSidebar />`, `<Header />`.
- **Buttons:** "View Details" per site card.
- **Cards:** Site summary cards (name, severity badge, last checked date).
- **Loading State:** Skeleton map + skeleton site cards.
- **Error State:** "Unable to load site data — showing cached results" banner + fallback JSON.
- **Empty State:** N/A (sites are seeded, list is never empty in demo).
- **Mobile:** Stack map on top, site list below, full-width cards.

### Page 2: Site Detail
- **Purpose:** Deep dive into one site.
- **Layout:** Two-column — left: before/after image slider + risk gauge; right: verdict card + time-series chart + metadata (coordinates, last updated, data source).
- **Components:** `<RiskGauge />`, `<BeforeAfterImages />`, `<VerdictCard />`, `<TimeSeriesChart />`, `<BackButton />`.
- **Forms:** None (no user input required).
- **Charts:** Line chart, NDWI/NDVI over time, baseline band shaded.
- **Loading State:** Spinner on chart/image areas independently (progressive load).
- **Error State:** "Imagery unavailable for this date range" per component, isolated (one failure shouldn't blank the page).
- **Empty State:** `insufficient_data` sites show explanatory copy instead of blank chart.
- **Mobile:** Single column, image slider full-width, chart scrollable horizontally if needed.

### Page 3 (Stretch): Compare View
- **Purpose:** Side-by-side site comparison.
- **Layout:** Two `<SiteDetail>`-lite cards side by side (desktop) / stacked (mobile).

---

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Fast setup, file-based routing, good Vercel deploy story, team likely already knows it |
| Styling | Tailwind CSS | Fast to build clean UI without design overhead |
| Maps | Mapbox GL JS (or React-Leaflet as free fallback) | Mapbox looks polished for judges; Leaflet is a zero-cost fallback if Mapbox token setup eats time |
| Charts | Recharts | Simple API, good enough visuals for a 12h build |
| Backend | FastAPI (Python) | Fast to write, native fit with the Python-based AI/data pipeline (same language, no context switching for Dev A/B) |
| Database | PostgreSQL (hosted on Supabase free tier) | Real relational DB as required; Supabase gives instant hosted Postgres so all 4 devs share one DB with zero local setup friction |
| ORM | SQLAlchemy | Standard, well-documented, fast to scaffold models |
| AI/ML | Google Earth Engine Python API + NumPy/Pandas | GEE does heavy geospatial lifting server-side (cloud masking, index computation) — this is what makes the 12-hour timeline realistic |
| Auth | None | Explicitly not required for this build |
| Storage | Supabase Storage (or just static files served by FastAPI) for before/after images | Avoids setting up a separate S3 bucket under time pressure |
| Hosting (Frontend) | Vercel | One-command deploy, free tier, fast |
| Hosting (Backend) | Railway or Render | Free tier, one-command deploy from GitHub, supports FastAPI out of the box |
| State Management | React Context + `fetch`/SWR | No need for Redux at this scale |

---

## 7. Libraries & Frameworks

| Library | Purpose | Install | Where Used | Why Chosen | Alternative |
|---|---|---|---|---|---|
| fastapi | Backend API framework | `pip install fastapi uvicorn` | Backend | Fast, async, auto docs (Swagger) for free debugging | Flask (slower to scaffold) |
| sqlalchemy | ORM | `pip install sqlalchemy` | Backend | Standard, works cleanly with Postgres | Raw SQL (riskier under time pressure) |
| psycopg2-binary | Postgres driver | `pip install psycopg2-binary` | Backend | Required for SQLAlchemy + Postgres | asyncpg (more setup) |
| earthengine-api | Satellite data + index computation | `pip install earthengine-api` | Data pipeline | Server-side geospatial processing — avoids writing raster math from scratch | Sentinel Hub SDK (more manual preprocessing) |
| pandas / numpy | Data wrangling, z-score calc | `pip install pandas numpy` | Data pipeline | Standard, fast for time-series stats | — |
| next | Frontend framework | `npx create-next-app@latest` | Frontend | Fast setup, good deploy story | Vite + React (marginal setup time savings, less structure) |
| tailwindcss | Styling | `npm install -D tailwindcss` | Frontend | Fast to build clean UI with no CSS files to manage | Plain CSS (slower) |
| recharts | Charts | `npm install recharts` | Frontend | Simple declarative API | Chart.js (more config) |
| react-leaflet / mapbox-gl | Maps | `npm install react-leaflet leaflet` OR `npm install mapbox-gl` | Frontend | Leaflet = zero-cost fallback; Mapbox = more polish if token setup is quick | Google Maps (heavier auth setup) |
| swr | Data fetching/caching | `npm install swr` | Frontend | Handles loading/error states with minimal code | Plain fetch + useEffect |
| python-dotenv | Env var management | `pip install python-dotenv` | Backend, Data pipeline | Keep API keys out of code | — |

---

## 8. APIs

### Google Earth Engine API
- **Purpose:** Pull Sentinel-2 imagery, compute NDWI/NDVI server-side.
- **Docs:** https://developers.google.com/earth-engine
- **Auth:** Service account JSON key (register and authenticate *before* the hackathon — approval/setup can take time).
- **Request Format:** Python client calls (`ee.ImageCollection(...).filterBounds(...).filterDate(...)`).
- **Response Format:** Python `ee.Image`/`ee.FeatureCollection` objects; export as GeoTIFF/PNG or extract as numeric values via `.reduceRegion()`.
- **Rate Limits:** Generous for this scale of use (a handful of sites, a few dozen date queries); not a practical concern at hackathon scale.
- **Integration Steps:** 1) Register GEE account 2) Create service account + download key JSON 3) `ee.Initialize()` with credentials 4) Query per site AOI.
- **Backup:** If GEE access is delayed/blocked, fall back to directly querying the **Copernicus Open Access Hub** or pre-downloading a handful of Sentinel-2 scenes from **USGS EarthExplorer** and computing indices locally with `rasterio`.

### Mapbox GL JS (if chosen over Leaflet)
- **Purpose:** Map rendering.
- **Docs:** https://docs.mapbox.com/mapbox-gl-js/
- **Auth:** Free API token (instant signup).
- **Backup:** React-Leaflet with OpenStreetMap tiles (no token needed at all — use this if Mapbox setup stalls).

---

## 9. Dataset Planning

**Required Data:** Sentinel-2 Level-2A surface reflectance imagery for 3–5 pre-selected real sites.

**Site Selection (do this BEFORE the 12-hour clock starts):**
1. Pick 1–2 sites with a **documented, verifiable** pollution/contamination or land-cover-change event with a known approximate date (search news archives, environmental agency reports, NGO documentation).
2. Pick 1–2 **control sites** (stable water bodies) to prove the system doesn't just flag everything.
3. Record each site's precise coordinates/bounding polygon in advance.

**Download Source:** Google Earth Engine (`COPERNICUS/S2_SR_HARMONIZED` collection) — no manual download needed, queried directly.

**Cleaning:** Cloud masking via the Sentinel-2 `QA60` band or `s2cloudless` probability band, filtering out images with >40% cloud cover over the AOI.

**Preprocessing:** Compute NDWI = (Green − NIR)/(Green + NIR), NDVI = (NIR − Red)/(NIR + Red), aggregate to a single mean value per AOI per available date.

**Storage:** Written into the `observations` table (see Section 11) — not stored as raw rasters, only the computed scalar values, keeping DB small and fast.

**Versioning:** Not needed at hackathon scale — one clean pipeline run per site is sufficient; re-run and overwrite if a bug is found.

**Expected Schema (per observation row):** `site_id, date, ndwi, ndvi, cloud_cover_pct, source ("Sentinel-2")`.

---

## 10. AI System Design

```
Site AOI (lat/lon or polygon) + date range
        ↓
Google Earth Engine: filter Sentinel-2 collection by bounds + date
        ↓
Preprocessing: cloud mask (QA60/s2cloudless), keep images <40% cloud
        ↓
Feature Engineering: compute NDWI, NDVI per image; reduceRegion → mean value per date
        ↓
Baseline construction: mean (μ) and std (σ) of index values over a defined "baseline period"
        ↓
Anomaly scoring: z = (current_period_mean − μ) / σ
        risk_score = min(100, abs(z) × 25)   [clamped, tunable constant]
        severity = Low (score<30) / Moderate (30–60) / High (>60)
        ↓
Post-processing: verdict text generated from severity + which index moved + direction
        ↓
Written to PostgreSQL (observations + anomaly_scores tables)
        ↓
FastAPI serves precomputed results
        ↓
Frontend renders gauge, chart, verdict, before/after images
```

**Model Selection:** Statistical z-score anomaly detection (not a trained ML model) — this is the right choice at this timescale: it's explainable, doesn't need training data, and is defensible in Q&A ("we flag statistically significant deviation from each site's own historical baseline"). **Stretch goal (only if ahead of schedule):** run `sklearn.ensemble.IsolationForest` across NDWI+NDVI jointly for a slightly richer anomaly signal — present as an enhancement, not the core mechanism.

**Training Approach:** None required (unsupervised/statistical method, no labeled training set needed).

**Evaluation:** Validate the pipeline correctly flags your 1–2 known-event sites as anomalous and correctly does NOT flag your control sites — this is your "accuracy" story for judges.

**Deployment:** Pipeline is a standalone Python script run by Dev B, writing directly to the shared Supabase Postgres DB — it does not need to be deployed as a live service for the demo.

**Optimization:** None needed at this scale — a handful of sites, a handful of dates each.

---

## 11. Database Design

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────────┐
│        sites         │        │       observations        │        │      anomaly_scores       │
├─────────────────────┤        ├──────────────────────────┤        ├──────────────────────────┤
│ id (PK)              │───┐    │ id (PK)                   │    ┌──│ id (PK)                   │
│ name                 │   └───▶│ site_id (FK → sites.id)   │◀───┘  │ site_id (FK → sites.id)   │
│ latitude              │        │ date                       │        │ computed_at                │
│ longitude             │        │ ndwi                       │        │ score (0-100)              │
│ site_type             │        │ ndvi                       │        │ severity                   │
│ description           │        │ cloud_cover_pct            │        │ baseline_mean              │
│ image_before_url      │        │ source                     │        │ baseline_std                │
│ image_after_url       │        └──────────────────────────┘        │ current_value               │
│ created_at            │                                             │ metric_used                 │
└─────────────────────┘                                             │ verdict_text                │
                                                                      └──────────────────────────┘
```

**Relationships:** `sites` 1—N `observations`; `sites` 1—N `anomaly_scores` (typically 1 latest row per site, but table allows history).

**Indexes:** Index `observations(site_id, date)` and `anomaly_scores(site_id, computed_at)` for fast lookups.

**SQL DDL:**
```sql
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    site_type VARCHAR(50),
    description TEXT,
    image_before_url TEXT,
    image_after_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE observations (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ndwi DOUBLE PRECISION,
    ndvi DOUBLE PRECISION,
    cloud_cover_pct DOUBLE PRECISION,
    source VARCHAR(50) DEFAULT 'Sentinel-2'
);
CREATE INDEX idx_obs_site_date ON observations(site_id, date);

CREATE TABLE anomaly_scores (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    computed_at TIMESTAMP DEFAULT NOW(),
    score DOUBLE PRECISION,
    severity VARCHAR(20),
    baseline_mean DOUBLE PRECISION,
    baseline_std DOUBLE PRECISION,
    current_value DOUBLE PRECISION,
    metric_used VARCHAR(20),
    verdict_text TEXT
);
CREATE INDEX idx_scores_site_time ON anomaly_scores(site_id, computed_at);
```

---

## 12. Backend Architecture

```
backend/
├── main.py                  # FastAPI app entrypoint
├── config.py                 # env var loading (DB url, GEE creds path)
├── database.py                # SQLAlchemy engine/session setup
├── models/
│   ├── site.py                 # Site ORM model
│   ├── observation.py          # Observation ORM model
│   └── anomaly_score.py        # AnomalyScore ORM model
├── schemas/
│   ├── site.py                 # Pydantic response schemas
│   ├── observation.py
│   └── anomaly_score.py
├── routers/
│   ├── sites.py                # /api/sites endpoints
│   └── health.py                # /api/health check
├── services/
│   └── site_service.py         # business logic (fetch + assemble response)
├── pipeline/                   # NOT part of the live API — run manually
│   ├── gee_client.py            # GEE auth + query helpers
│   ├── compute_indices.py       # NDWI/NDVI computation
│   ├── anomaly.py                # z-score + severity + verdict logic
│   └── seed_data.py              # runs full pipeline, writes to DB
├── requirements.txt
└── .env.example
```

**Controllers/Routes:** Thin — routers call `services/` functions, which query the DB via SQLAlchemy and return Pydantic-validated responses.

**Middleware:** CORS middleware (allow frontend origin) — the only middleware needed given no auth.

**Logging:** Python `logging` module, INFO level, log every pipeline step and every API error to console (sufficient for a 12h build).

**Validation:** Pydantic schemas validate all API responses; pipeline validates cloud-cover threshold before accepting an observation.

**Error Handling:** Global FastAPI exception handler returns consistent JSON error shape `{ "error": "message" }`; 404 for unknown site IDs.

---

## 13. Frontend Architecture

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                    # Homepage (map + list)
│   ├── sites/[id]/page.tsx         # Site detail page
│   ├── compare/page.tsx            # Stretch: comparison view
│   └── layout.tsx
├── components/
│   ├── MapView.tsx
│   ├── SiteMarker.tsx
│   ├── SiteListSidebar.tsx
│   ├── SiteDetail.tsx
│   ├── RiskGauge.tsx
│   ├── TimeSeriesChart.tsx
│   ├── BeforeAfterImages.tsx
│   ├── VerdictCard.tsx
│   └── Header.tsx
├── hooks/
│   └── useSites.ts                  # SWR-based data fetching hook
├── lib/
│   ├── api.ts                        # fetch wrapper, base URL config
│   └── fallbackData.json             # cached sites data for offline fallback
├── styles/
│   └── globals.css
├── public/
├── .env.local.example
└── package.json
```

**State Management:** SWR handles fetch/cache/error/loading — no global state library needed at this scope.

**Routing:** Next.js file-based routing (`app/sites/[id]/page.tsx` handles dynamic site pages automatically).

---

## 14. API Endpoints

| Method | URL | Description | Request Body | Response | Validation |
|---|---|---|---|---|---|
| GET | `/api/health` | Health check | — | `{ "status": "ok" }` | — |
| GET | `/api/sites` | List all sites with latest score | — | `[{ id, name, lat, lon, severity, score }]` | — |
| GET | `/api/sites/{id}` | Full site detail | — | `{ id, name, lat, lon, description, image_before_url, image_after_url, latest_score, verdict_text }` | 404 if not found |
| GET | `/api/sites/{id}/timeseries` | Historical NDWI/NDVI values | — | `[{ date, ndwi, ndvi }]` | 404 if not found |
| GET | `/api/sites/{id}/anomaly` | Full anomaly score detail | — | `{ score, severity, baseline_mean, baseline_std, current_value, verdict_text }` | 404 if not found |

*(No POST/PUT/DELETE endpoints needed for the demo — all data is written by the offline pipeline script directly to the DB.)*

---

## 15. Project Folder Structure

```
aquawatch-ai/
├── backend/                  # FastAPI app (see Section 12)
├── frontend/                 # Next.js app (see Section 13)
├── docs/
│   ├── BLUEPRINT.md            # this document
│   ├── sites.md                 # research notes on chosen sites + sources
│   └── demo-script.md           # word-for-word demo talk track
├── .gitignore
└── README.md
```

---

## 16. Development Roadmap

```
Project Setup (repo, DB, GEE auth)
        ↓
Database Schema (Section 11)
        ↓
Data Pipeline (GEE → indices → anomaly scores → DB)          ─┐
        ↓                                                      │ can run in parallel
Backend API (endpoints reading from DB)                        │ with frontend build
        ↓                                                     ─┘
Frontend (map, list, detail page) — build against mock data first, swap to live API once backend ready
        ↓
Integration (frontend ↔ real backend ↔ real DB)
        ↓
Polish (loading/error states, mobile check)
        ↓
Demo Rehearsal + Deployment
```

---

## 17. Complete Task List

| ID | Title | Description | Assigned | Est. Time | Priority | Dependencies | Acceptance Criteria | Status |
|---|---|---|---|---|---|---|---|---|
| T01 | Repo + env setup | Create GitHub repo, folder structure, .env templates | All | 0.5h | Must | — | Repo cloned by all 4, runs locally | Not Started |
| T02 | Provision Supabase Postgres | Create project, get connection string, share with team | Dev A | 0.3h | Must | T01 | All devs can connect | Not Started |
| T03 | Define DB schema + migrations | Write SQLAlchemy models + create tables | Dev A | 1h | Must | T02 | Tables exist in DB, verified via query | Not Started |
| T04 | GEE auth + test query | Authenticate service account, run one test AOI query | Dev B | 1h | Must | T01 | Returns real NDWI value for 1 site | Not Started |
| T05 | Finalize site list + coordinates | Confirm 3-5 sites with sources documented | Dev B + Dev D | (pre-hackathon) | Must | — | `sites.md` complete with coordinates + sources | Not Started |
| T06 | Index computation pipeline | Compute NDWI/NDVI per date per site | Dev B | 2h | Must | T04, T05 | CSV/DB rows of real values for all sites | Not Started |
| T07 | Anomaly scoring logic | z-score + severity + verdict text | Dev B | 1.5h | Must | T06 | Correctly flags known-event site as High | Not Started |
| T08 | Before/after image export | Export/thumbnail URLs per site | Dev B | 1h | Must | T04 | Valid image URLs for all sites | Not Started |
| T09 | Seed script (pipeline → DB) | Write all computed data into Postgres | Dev B | 1h | Must | T03, T07, T08 | `observations` + `anomaly_scores` populated | Not Started |
| T10 | FastAPI skeleton + CORS | App entrypoint, routers, CORS config | Dev A | 1h | Must | T03 | `/api/health` returns 200 | Not Started |
| T11 | `/api/sites` endpoints | List + detail + timeseries + anomaly endpoints | Dev A | 2h | Must | T09, T10 | All endpoints return real DB data | Not Started |
| T12 | Deploy backend (Railway/Render) | Push to hosting, verify public URL works | Dev A | 1h | Must | T11 | Public API URL reachable | Not Started |
| T13 | Next.js scaffold + Tailwind | Init project, base layout, routing | Dev C | 1h | Must | T01 | App runs locally | Not Started |
| T14 | MapView + SiteMarker | Map with clickable pins | Dev C | 2h | Must | T13 | Pins render at correct coordinates | Not Started |
| T15 | SiteListSidebar + Homepage | List/cards next to map | Dev C | 1.5h | Must | T14 | Cards match map pins | Not Started |
| T16 | Site Detail page shell | Route + layout for `/sites/[id]` | Dev D | 1h | Must | T13 | Navigates from homepage correctly | Not Started |
| T17 | RiskGauge component | Visual score indicator | Dev D | 1h | Should | T16 | Renders correct color per severity | Not Started |
| T18 | TimeSeriesChart component | Recharts line chart | Dev D | 1.5h | Must | T16 | Chart renders NDWI/NDVI over time | Not Started |
| T19 | BeforeAfterImages + VerdictCard | Image slider + verdict text display | Dev D | 1.5h | Must | T16 | Images + verdict text render correctly | Not Started |
| T20 | Connect frontend to real API | Swap mock data for live backend calls (SWR hooks) | Dev C + Dev D | 1h | Must | T12, T15, T19 | All pages show real data | Not Started |
| T21 | Loading/error/empty states | Add across all components | Dev C + Dev D | 1h | Should | T20 | No blank/broken states on slow/failed load | Not Started |
| T22 | Mobile responsiveness pass | Check/fix all pages on mobile width | Dev C | 0.5h | Should | T20 | Usable on phone-width viewport | Not Started |
| T23 | Deploy frontend (Vercel) | Push, connect to backend URL via env var | Dev C | 0.5h | Must | T20 | Public frontend URL reachable | Not Started |
| T24 | End-to-end test pass | Click through entire app, all 4 devs | All | 0.5h | Must | T23 | No console errors, all sites load | Not Started |
| T25 | Demo script + rehearsal | Write and rehearse 3-min talk track | Dev D | 1h | Must | T24 | Full run-through under 3 min | Not Started |
| T26 | README + submission assets | Write README, take screenshots | Dev A | 0.5h | Must | T24 | README complete per Section 24 | Not Started |
| T27 | Compare view (stretch) | Build only if ahead of schedule | Dev C/D | 1.5h | Nice | T20 | Two sites render side by side | Not Started |
| T28 | PDF export (stretch) | Build only if ahead of schedule | Dev A/B | 1.5h | Nice | T11 | Downloadable PDF matches site detail data | Not Started |

---

## 18. Team Allocation

| Developer | Primary Role | Owns |
|---|---|---|
| **Dev A** | Backend Lead | DB schema, FastAPI app, endpoints, backend deployment, README |
| **Dev B** | AI/Data Lead | GEE pipeline, index computation, anomaly scoring, verdict logic, DB seeding |
| **Dev C** | Frontend Lead | Next.js setup, map, homepage, deployment, mobile responsiveness |
| **Dev D** | Frontend/Integration + Demo Lead | Site detail page, charts, images, verdict UI, API integration, demo script |

**Why this split minimizes blockers:** Dev A and Dev B can both work independently for the first ~4 hours (backend skeleton doesn't need real data yet; pipeline doesn't need the API yet) — they converge at T09/T11. Dev C and Dev D build the frontend against mock/fallback JSON data from hour 0, so they're never blocked waiting on the backend — they swap to live data at T20. This means **no developer is idle waiting on another for the first 6 hours.**

---

## 19. Git & Collaboration Workflow

**Branch Strategy:** `main` (always deployable) + short-lived feature branches (`feat/backend-endpoints`, `feat/map-view`, etc.) — no long-running `dev` branch, too slow for 12 hours.

**Commit Convention:** `type: short description` — e.g. `feat: add anomaly scoring endpoint`, `fix: cloud cover filter threshold`.

**Pull Request Workflow:** For a 12-hour hackathon, skip formal PR review — push to feature branch, merge to `main` yourself once it runs locally, notify team in chat. Speed matters more than process here.

**Merge Strategy:** Fast-forward/simple merge; resolve conflicts immediately in a quick call, don't let them sit.

**Daily Sync:** Given 12 hours total, do a **15-minute sync every 3 hours** (roughly at T+3, T+6, T+9) instead of a daily standup — quick check: what's done, what's blocked, do we cut any Nice-to-Have features.

---

## 20. 12-Hour Sprint Plan

| Time | Focus | Deliverable by end of block |
|---|---|---|
| **0–1h** | Setup | Repo live, DB provisioned, GEE auth working, all 4 devs running locally |
| **1–3h** | Parallel build begins | Dev A: DB schema + FastAPI skeleton. Dev B: real NDWI/NDVI values for 1 site. Dev C: map + homepage against mock data. Dev D: site detail page shell against mock data |
| **3–6h** | Core pipeline + core pages | Dev B: all sites' indices + anomaly scores computed. Dev A: endpoints built against real schema. Dev C/D: all frontend components built and visually complete against mock data |
| **6–8h** | Integration | DB seeded with real data (T09), backend deployed (T12), frontend swapped to live API (T20) |
| **8–10h** | Polish | Loading/error states, mobile pass, before/after images verified, verdict text reviewed for clarity |
| **10–11h** | Final testing + deploy | Full end-to-end run-through, frontend deployed, fix any last bugs |
| **11–12h** | Demo prep | Rehearse demo script twice, prepare for Q&A (Section 13 from earlier scoring conversation), submit README/assets |

**Critical checkpoint at T+6h:** If the real data pipeline is not producing usable results by hour 6, fall back immediately to a smaller set of pre-verified sites with manually-confirmed values rather than debugging GEE further — protecting the demo matters more than pipeline completeness.

---

## 21. Testing Plan

**Unit Testing:** Test the anomaly scoring function (`anomaly.py`) with known inputs — e.g., feed it a mock series with an obvious spike, confirm it returns High severity; feed it a flat series, confirm Low.

**API Testing:** Use FastAPI's auto-generated Swagger UI (`/docs`) to manually verify every endpoint returns expected shape and correct data for each site ID.

**Frontend Testing:** Manual click-through of every page/state (loading, loaded, error, empty) — no time for automated frontend tests at this scale.

**Integration Testing:** Full path test — change a value in the DB directly, confirm it reflects correctly through API → frontend without a restart needed (validates no stale caching issues).

**Edge Cases to test explicitly:**
- Site with `insufficient_data` (no crash, clear message).
- Slow network (loading states don't hang forever/infinite spinner).
- Site ID that doesn't exist (404 handled gracefully in UI, not a blank crash page).

**Manual Testing Checklist (run before submission):**
- [ ] All sites load on homepage map
- [ ] All site detail pages load without console errors
- [ ] At least one site clearly shows High severity with matching before/after imagery
- [ ] At least one control site clearly shows Low severity
- [ ] Chart renders correctly for every site
- [ ] Mobile view usable for homepage and detail page
- [ ] Deployed URLs (frontend + backend) both work from a fresh browser/incognito window

---

## 22. Deployment Plan

**Frontend:** Deploy to Vercel via GitHub integration — push to `main`, auto-deploys. Set `NEXT_PUBLIC_API_URL` env var to point at deployed backend URL.

**Backend:** Deploy to Railway or Render via GitHub integration — set start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

**Database:** Already hosted on Supabase — no separate deployment step; just ensure connection string is set as an env var (`DATABASE_URL`) on the backend host, not committed to git.

**Environment Variables:**
- Backend: `DATABASE_URL`, `GEE_SERVICE_ACCOUNT_JSON_PATH` (or inline credentials, only needed for the offline pipeline, not the live API)
- Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN` (if using Mapbox)

**Monitoring:** Not needed at hackathon scale — just confirm both URLs are live and responsive right before your demo slot.

**CI/CD:** Not needed — GitHub-integrated auto-deploy on push is sufficient; skip building custom pipelines, it's wasted time for a 12-hour build.

---

## 23. Demo Strategy

**Demo Flow (3 minutes):**
1. **(20s) Open on the problem:** "Environmental damage near waterways often goes unnoticed for months because monitoring depends on someone happening to look. We built a system that watches continuously, using free satellite data."
2. **(30s) Show the map:** Homepage loads, pins visible, colored by severity. "These are real, verified locations — this one has a documented history."
3. **(60s) Click into the flagged site:** Show before/after satellite imagery side by side, risk gauge showing High, time-series chart showing the deviation from baseline, verdict text reading the plain-language explanation aloud.
4. **(30s) Click into a control site:** "And to show this isn't just flagging everything — here's a stable site, correctly scored Low." This is your credibility moment.
5. **(20s) Explain the mechanism briefly:** "Under the hood, this is a real pipeline — satellite data flows into a live database through an API we built, not a static demo."
6. **(20s) Closing statement:** "This shrinks the gap between damage happening and someone finding out — and that gap is where most preventable environmental damage accumulates. Thank you."

**What Judges See:** Real map → real imagery → real chart → a plain sentence they understand without technical background → a second example proving it's not just a gimmick.

**Environmental Impact statement to include:** Frame honestly per the earlier discussion — "This is a detection and awareness layer, not a cleanup tool. Its value is in compressing response time, which is where remediation cost and cumulative damage are lowest."

---

## 24. README Structure

```markdown
# AquaWatch AI

## Problem
[2-3 sentences]

## Solution
[2-3 sentences]

## How It Works
[Short version of Section 10 pipeline diagram]

## Tech Stack
[Table from Section 6]

## Live Demo
- Frontend: [URL]
- Backend API docs: [URL]/docs

## Screenshots
[2-3 images]

## Team
[Names + roles]

## Data Sources
[Sentinel-2 via Google Earth Engine, site verification sources]

## Running Locally
[Setup steps for backend + frontend]

## What We'd Build Next
[Honest limitations + roadmap — shows maturity to judges]
```

---

## 25. Final Submission Checklist

**Code:**
- [ ] Repo public (or accessible to judges)
- [ ] No API keys/secrets committed to git
- [ ] Code runs from a fresh clone following README steps

**Documentation:**
- [ ] README complete (Section 24)
- [ ] `sites.md` documents source/verification for each chosen site

**Testing:**
- [ ] Manual testing checklist (Section 21) fully passed
- [ ] Tested in incognito/fresh browser session

**Deployment:**
- [ ] Frontend live and reachable
- [ ] Backend live and reachable
- [ ] Both tested together end-to-end after deployment (not just locally)

**Demo:**
- [ ] Demo script rehearsed at least twice, under 3 minutes
- [ ] Backup plan if wifi fails at venue (local version running, screen recording as fallback)

**Presentation/Pitch:**
- [ ] Opening problem statement is one sentence, not a paragraph
- [ ] Closing environmental impact statement is honest, not inflated (see Section 23)
- [ ] Prepared for the "is this AI or just statistics?" question — answer honestly: statistical anomaly detection, explainable by design

**Submission Assets:**
- [ ] Screenshots/GIF for submission form
- [ ] Team names + roles listed
- [ ] Live URLs included in submission
