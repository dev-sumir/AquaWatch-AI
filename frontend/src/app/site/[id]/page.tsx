import { fetchSiteDetails, analyzeCoordinate } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import RiskGauge from '@/components/RiskGauge';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import BeforeAfterImages from '@/components/BeforeAfterImages';
import VerdictCard from '@/components/VerdictCard';
import DownloadReportButton from '@/components/DownloadReportButton';

export default async function SiteDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lat?: string, lon?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  let site;
  if (resolvedParams.id === 'dynamic') {
    if (!resolvedSearchParams.lat || !resolvedSearchParams.lon) return notFound();
    site = await analyzeCoordinate(parseFloat(resolvedSearchParams.lat), parseFloat(resolvedSearchParams.lon));
  } else {
    site = await fetchSiteDetails(parseInt(resolvedParams.id));
  }
  
  if (!site || !site.id) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-12" id="report-container">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 shadow-sm gap-4">
        <div className="flex items-center">
          <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Map</span>
          </Link>
          <h1 className="text-xl font-bold ml-4 border-l pl-4 border-gray-200 truncate max-w-[200px] md:max-w-none">{site.name}</h1>
        </div>
        <DownloadReportButton siteId={site.id} />
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Verdict & Gauge */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 self-start">Anomaly Risk Gauge</h2>
            {site.anomaly_score ? (
              <RiskGauge score={site.anomaly_score.score} severity={site.anomaly_score.severity} />
            ) : (
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center w-full text-gray-400">No score data</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-indigo-700">AI Anomaly Verdict</h2>
            <div className="flex-1 flex items-center justify-center">
                {site.anomaly_score ? (
                    <VerdictCard verdictText={site.anomaly_score.verdict_text} severity={site.anomaly_score.severity} />
                ) : (
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center w-full text-gray-400">No verdict data</div>
                )}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Images */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">NDWI & NDVI Time Series Analytics</h2>
            <div className="h-80 w-full">
              <TimeSeriesChart 
                data={site.observations} 
                baselineMean={site.anomaly_score?.baseline_mean} 
                metricUsed={site.anomaly_score?.metric_used} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Before & After Imagery</h2>
            <div className="w-full">
              <BeforeAfterImages beforeUrl={site.image_before_url} afterUrl={site.image_after_url} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
