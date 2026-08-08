"""
Seed script for AquaWatch AI Health Records.
Creates the health_records table and populates it with 10 realistic demo records.

Usage: python seed_health_records.py
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
# Import ALL models so Base.metadata knows about all tables
from models import Site, Observation, AnomalyScore, HealthRecord

def seed():
    # Create all tables (only creates if they don't exist)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables ensured (health_records created if needed)")

    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(HealthRecord).filter(HealthRecord.record_id == "RECORD-001").first()
        if existing:
            print("✓ Health records already seeded. Skipping.")
            return

        now = datetime.now()
        records = [
            HealthRecord(
                record_id="RECORD-001",
                title="Yamuna River Okhla Barrage — Severe Contamination Event",
                location="Yamuna River at Okhla Barrage, New Delhi",
                latitude=28.5670,
                longitude=77.2986,
                record_date=now - timedelta(days=2),
                condition_type="Contamination",
                severity="High",
                status="Active",
                department="Water Quality",
                detected_anomaly="Satellite-derived NDWI analysis reveals a significant 38% drop in water clarity index compared to the 12-month baseline. Spectral signatures are consistent with elevated Total Suspended Solids (TSS) and organic pollutant loading. The anomaly is concentrated along a 2.3 km stretch downstream of the Okhla Barrage industrial outfall zone.",
                spectral_indicators="NDWI baseline mean: 0.28, current: 0.11. NDVI riparian corridor shows concurrent 15% decline. Band 4 (Red) reflectance elevated, suggesting sediment/algal turbidity. Band 8A (NIR) absorption reduced — classic pollution plume signature.",
                recommendations="1. Deploy portable water quality sensors at 3 points along the affected stretch. 2. Cross-reference with CPCB real-time monitoring station data. 3. Issue advisory to downstream water treatment plants. 4. Coordinate with Delhi Pollution Control Committee for industrial discharge audit.",
                notes="This location has been flagged in 3 of the last 6 monthly assessments. The current event coincides with pre-monsoon low-flow conditions, which concentrate pollutant loads. Historical pattern suggests upstream industrial discharge as the primary contributor.",
                ndwi_value=0.1134,
                ndvi_value=0.3421,
                site_id=None,
                # Pre-configured attachment (satellite anomaly image)
                attachment_name="Satellite Anomaly Image - Yamuna Okhla",
                attachment_type="image",
                attachment_url="/static/images/buddha_nullah_after.jpg",
                attachment_original_filename="satellite_anomaly_yamuna.jpg",
                attachment_size_bytes=177538,
                attachment_mime_type="image/jpeg",
            ),
            HealthRecord(
                record_id="RECORD-002",
                title="Ganges at Kanpur — Industrial Discharge Detected",
                location="Ganges River, Jajmau Industrial Area, Kanpur",
                latitude=26.4717,
                longitude=80.3729,
                record_date=now - timedelta(days=5),
                condition_type="Industrial Discharge",
                severity="Critical",
                status="Active",
                department="Industrial Monitoring",
                detected_anomaly="Multi-temporal analysis detects persistent spectral anomaly over a 4.1 km river segment adjacent to the Jajmau tannery cluster. NDWI deviation exceeds 3.2 standard deviations from baseline — the highest recorded in 18 months. Color composite imagery reveals discoloration consistent with chromium-laden tannery effluent.",
                spectral_indicators="NDWI dropped from baseline 0.31 to 0.04. Abnormal reflectance peak in Band 5 (Red Edge) at 705nm — associated with dissolved chromium compounds. NDVI in riparian buffer zone declined 22%.",
                recommendations="1. EMERGENCY: Notify Uttar Pradesh Pollution Control Board immediately. 2. Deploy field team for grab sampling (chromium, BOD, COD). 3. Cross-check with Namami Gange monitoring network. 4. Issue downstream alert to Allahabad water intake. 5. Recommend temporary shutdown order for non-compliant tanneries.",
                notes="Jajmau industrial cluster has 400+ registered tanneries. Despite CETP (Common Effluent Treatment Plant) infrastructure, compliance monitoring indicates frequent bypass events during high-production periods. This event severity warrants escalation to National Green Tribunal.",
                ndwi_value=0.0412,
                ndvi_value=0.2891,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-003",
                title="Ropar Wetland — Stable Conditions Confirmed",
                location="Ropar Wetland (Ramsar Site), Punjab",
                latitude=31.0174,
                longitude=76.5370,
                record_date=now - timedelta(days=3),
                condition_type="Routine Assessment",
                severity="Low",
                status="Resolved",
                department="Ecosystem Health",
                detected_anomaly="No significant anomaly detected. All spectral indices are within 0.8 standard deviations of the 12-month baseline. The wetland ecosystem shows healthy seasonal variation patterns consistent with the pre-monsoon transition period.",
                spectral_indicators="NDWI: 0.34 (baseline: 0.32 ± 0.04). NDVI: 0.61 (baseline: 0.58 ± 0.06). Both indices indicate stable, healthy water body and surrounding vegetation.",
                recommendations="1. Continue routine quarterly monitoring. 2. Schedule next comprehensive assessment for post-monsoon period (October). 3. Maintain current conservation buffer zone regulations.",
                notes="Ropar Wetland is a designated Ramsar Site and serves as a control location in our monitoring network. Consistent low anomaly scores validate our detection methodology — the system correctly identifies healthy sites as stable.",
                ndwi_value=0.3389,
                ndvi_value=0.6102,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-004",
                title="Hussain Sagar Lake — Algal Bloom Event",
                location="Hussain Sagar Lake, Hyderabad, Telangana",
                latitude=17.4239,
                longitude=78.4738,
                record_date=now - timedelta(days=8),
                condition_type="Algal Bloom",
                severity="High",
                status="Monitoring",
                department="Water Quality",
                detected_anomaly="Sentinel-2 true-color imagery reveals extensive green discoloration across approximately 60% of the lake surface area. Spectral analysis confirms cyanobacterial bloom (blue-green algae) with characteristic chlorophyll-a absorption peak. Bloom appears to have developed rapidly over a 10-day window.",
                spectral_indicators="NDWI shifted negative (-0.08) due to algal surface coverage masking water signal. Elevated reflectance in Band 3 (Green) and absorption in Band 4 (Red) — classic chlorophyll-a signature. Floating Algae Index (FAI) positive across 2.1 km² of the 5.7 km² lake surface.",
                recommendations="1. Issue public health advisory — no swimming or fishing. 2. Test for microcystin and other cyanotoxins. 3. Assess municipal sewage inflow nutrient loading (phosphorus, nitrogen). 4. Consider emergency aeration measures. 5. Coordinate with GHMC for sewage treatment plant discharge review.",
                notes="Hussain Sagar has chronic eutrophication issues due to untreated sewage inflow from surrounding residential areas. This bloom event coincides with elevated temperatures (38°C+) and low wind conditions — both favorable for cyanobacterial proliferation. Previous bloom events in 2024 and 2025 followed similar seasonal patterns.",
                ndwi_value=-0.0823,
                ndvi_value=0.4521,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-005",
                title="Chilika Lake — Sediment Influx Anomaly",
                location="Chilika Lake, Odisha (Northern Sector)",
                latitude=19.7250,
                longitude=85.3200,
                record_date=now - timedelta(days=12),
                condition_type="Sediment Anomaly",
                severity="Moderate",
                status="Under Review",
                department="Ecosystem Health",
                detected_anomaly="Increased turbidity detected in the northern sector of Chilika Lake, likely driven by accelerated sedimentation from the Daya and Bhargavi river inflows. Suspended sediment concentration estimated at 2.3x the seasonal average based on Band 4/Band 3 reflectance ratio.",
                spectral_indicators="NDWI: 0.18 (baseline: 0.26). Elevated Band 4 (Red) reflectance indicates higher TSS. Turbidity plume extends 3.8 km from the Daya River confluence southward.",
                recommendations="1. Monitor sediment transport rates at river mouth stations. 2. Assess dredging schedule compliance for the Chilika mouth. 3. Review upstream catchment land-use changes (deforestation, construction). 4. Schedule bathymetric survey if sediment buildup persists.",
                notes="Chilika Lake is Asia's largest brackish water lagoon and a critical habitat for Irrawaddy dolphins. Sedimentation threatens ecological balance by reducing water depth and altering salinity gradients. The Chilika Development Authority should be notified.",
                ndwi_value=0.1812,
                ndvi_value=0.3954,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-006",
                title="Periyar River — Agricultural Runoff Event",
                location="Periyar River, Eloor Industrial Belt, Kerala",
                latitude=10.0676,
                longitude=76.2932,
                record_date=now - timedelta(days=18),
                condition_type="Agricultural Runoff",
                severity="Moderate",
                status="Monitoring",
                department="Agricultural Impact",
                detected_anomaly="Post-fertilizer application season runoff detected. Spectral signatures indicate elevated nutrient loading in a 6.2 km river stretch. NDVI analysis of adjacent agricultural plots shows recent harvest/tillage activity correlating with the runoff timing.",
                spectral_indicators="NDWI: 0.19 (baseline: 0.27). Slight green-band elevation suggesting early-stage nutrient enrichment. Riparian NDVI reduced 12% along affected stretch.",
                recommendations="1. Deploy nutrient monitoring (nitrate, phosphate) at 4 downstream stations. 2. Engage with local agricultural extension officers on fertilizer timing best practices. 3. Assess effectiveness of existing riparian buffer strips. 4. Report to Kerala State Pollution Control Board.",
                notes="The Periyar River downstream of Eloor has been identified by WHO as one of the most polluted river stretches globally. Industrial and agricultural impacts compound seasonally. This event represents agricultural runoff specifically, separate from industrial discharge.",
                ndwi_value=0.1923,
                ndvi_value=0.4102,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-007",
                title="Vembanad Lake — Thermal Anomaly Detected",
                location="Vembanad Lake, Kochi, Kerala",
                latitude=9.5916,
                longitude=76.3870,
                record_date=now - timedelta(days=25),
                condition_type="Thermal Pollution",
                severity="Low",
                status="Resolved",
                department="Industrial Monitoring",
                detected_anomaly="Minor thermal anomaly detected using Landsat 8/9 thermal band analysis near the Kochi industrial waterfront. Surface temperature elevated 2.1°C above ambient lake temperature in a 0.4 km² zone. The anomaly is localized and within regulatory thermal discharge limits.",
                spectral_indicators="NDWI: 0.29 (baseline: 0.31). Thermal Band 10 shows localized temperature differential. Optical bands show no significant water quality changes.",
                recommendations="1. Continue routine thermal monitoring. 2. Verify industrial cooling water discharge compliance. 3. No immediate action required — anomaly within permissible limits. 4. Log for trend analysis.",
                notes="Minor thermal discharge events are common in industrialized waterfront areas. This event was detected by our automated screening but assessment confirms it falls within CPCB thermal discharge norms (< 5°C differential). Classified as Low severity after review.",
                ndwi_value=0.2934,
                ndvi_value=0.5012,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-008",
                title="Buddha Nullah — Severe Eutrophication Crisis",
                location="Buddha Nullah Drain, Ludhiana, Punjab",
                latitude=30.9010,
                longitude=75.8573,
                record_date=now - timedelta(days=1),
                condition_type="Eutrophication",
                severity="Critical",
                status="Active",
                department="Emergency Response",
                detected_anomaly="Catastrophic eutrophication event detected. Satellite imagery shows complete surface coverage by dense algal/organic mat over a 12 km stretch of the Buddha Nullah drain before it enters the Sutlej River. Dissolved oxygen levels are estimated to be near-anoxic based on spectral indicators. Fish kill reports from ground observers corroborate the satellite detection.",
                spectral_indicators="NDWI: -0.21 (severe negative, indicating surface is no longer registering as water). NDVI: 0.52 (organic mat registering as vegetation). Complete spectral inversion — the water body is spectroscopically indistinguishable from land vegetation due to dense organic coverage.",
                recommendations="1. EMERGENCY: Activate district disaster response for environmental emergency. 2. Deploy dissolved oxygen supplementation equipment. 3. Issue health advisory for all communities within 500m of the drain. 4. Halt all dairy/food industry effluent discharge immediately. 5. Coordinate with Punjab Pollution Control Board for enforcement action. 6. Prepare media briefing on public health implications.",
                notes="Buddha Nullah receives untreated sewage and industrial waste from over 1,000 industrial units in Ludhiana. This event represents the most severe eutrophication episode detected in our monitoring history. The drain ultimately feeds into the Sutlej River, which supplies drinking water to downstream communities. Immediate intervention is critical.",
                ndwi_value=-0.2134,
                ndvi_value=0.5234,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-009",
                title="Dal Lake — Weed Encroachment Assessment",
                location="Dal Lake, Srinagar, Jammu & Kashmir",
                latitude=34.1209,
                longitude=74.8600,
                record_date=now - timedelta(days=35),
                condition_type="Algal Bloom",
                severity="Moderate",
                status="Under Review",
                department="Ecosystem Health",
                detected_anomaly="Progressive aquatic weed encroachment detected. Multi-temporal analysis over the past 90 days shows a 14% increase in floating vegetation coverage, predominantly in the Gagribal and Lokut Dal basins. The rate of encroachment has accelerated compared to the same period in 2025.",
                spectral_indicators="NDWI: 0.15 (baseline: 0.24). Open water area reduced from 12.4 km² to 10.7 km². NDVI over lake surface elevated to 0.38, indicating significant vegetation growth on water surface.",
                recommendations="1. Accelerate mechanical weed harvesting operations in Gagribal basin. 2. Review sewage treatment plant performance — nutrient reduction efficiency. 3. Commission hydrological study on water exchange rates. 4. Engage with houseboat community on waste management compliance.",
                notes="Dal Lake has been experiencing progressive eutrophication and weed encroachment for decades. The Srinagar Lake Conservation Authority has ongoing remediation programs, but the rate of encroachment continues to outpace removal capacity. Tourism-related nutrient loading remains a key driver.",
                ndwi_value=0.1534,
                ndvi_value=0.3812,
                site_id=None,
            ),
            HealthRecord(
                record_id="RECORD-010",
                title="Cauvery River Delta — Stable Water Quality",
                location="Cauvery River Delta, Thanjavur, Tamil Nadu",
                latitude=10.7870,
                longitude=79.1378,
                record_date=now - timedelta(days=40),
                condition_type="Routine Assessment",
                severity="Low",
                status="Resolved",
                department="Water Quality",
                detected_anomaly="No significant anomaly detected. Water quality indices are within normal seasonal ranges for the delta region. Minor turbidity increase consistent with expected agricultural drainage during the Samba rice cultivation season.",
                spectral_indicators="NDWI: 0.30 (baseline: 0.29 ± 0.05). NDVI: 0.72 (reflecting healthy rice paddies in the delta). All indices within 1 standard deviation of baseline.",
                recommendations="1. Continue routine bi-monthly monitoring. 2. No intervention required. 3. Schedule comprehensive assessment post-harvest (December).",
                notes="The Cauvery Delta is one of India's most productive agricultural regions. Seasonal turbidity fluctuations are expected during cultivation periods. This assessment confirms normal conditions and serves as a baseline reference point for the delta monitoring network.",
                ndwi_value=0.2989,
                ndvi_value=0.7234,
                site_id=None,
            ),
        ]

        for record in records:
            db.add(record)

        db.commit()
        print(f"✓ Successfully seeded {len(records)} health records")
        print("  Records: RECORD-001 through RECORD-010")
        print("  RECORD-001 has a pre-configured satellite anomaly image attachment")

    except Exception as e:
        db.rollback()
        print(f"✗ Error seeding records: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
