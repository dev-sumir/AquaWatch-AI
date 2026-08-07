"use client";
import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function SiteListSidebar({ sites }: { sites: any[] }) {
  const getBadgeColor = (severity: string) => {
    if (severity === 'High') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'Moderate') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 sticky top-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Activity className="w-6 h-6" />
            <span className="font-bold tracking-widest text-sm uppercase">AquaWatch AI</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Monitored Sites</h2>
        <p className="text-sm text-gray-500 mt-1">Select a site to view deep analytics.</p>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {sites.length === 0 && (
            <div className="text-center text-gray-500 mt-10">No sites found. Ensure API is running.</div>
        )}
        {sites.map(site => (
          <Link href={`/site/${site.id}`} key={site.id}>
            <div className="block p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg hover:ring-2 hover:ring-blue-50 transition-all cursor-pointer bg-white group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">{site.name}</h3>
                {site.anomaly_score && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(site.anomaly_score.severity)}`}>
                    {site.anomaly_score.severity}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mt-2">{site.description}</p>
              {site.anomaly_score && (
                <div className="mt-4 flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
                  Risk Score: <span className="ml-2 font-bold text-gray-900">{site.anomaly_score.score} / 100</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
