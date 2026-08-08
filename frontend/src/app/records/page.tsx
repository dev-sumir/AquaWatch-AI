import { Suspense } from 'react';
import { fetchHealthRecords, fetchFilterOptions } from '@/lib/api';
import RecordCard from '@/components/RecordCard';
import RecordSearchFilters from '@/components/RecordSearchFilters';
import Link from 'next/link';
import { Droplets, ArrowLeft, FileWarning, Activity, AlertTriangle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function RecordsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;

  let data, filterOptions;
  try {
    [data, filterOptions] = await Promise.all([
      fetchHealthRecords(params),
      fetchFilterOptions(),
    ]);
  } catch {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to load records</h2>
          <p className="text-gray-600 mb-4">Please check that the backend server is running.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">Return to Map</Link>
        </div>
      </main>
    );
  }

  // Calculate quick stats from current page (ideally would come from a dedicated stats endpoint)
  const criticalCount = data.records.filter(r => r.severity === 'Critical').length;
  const highCount = data.records.filter(r => r.severity === 'High').length;

  const buildPageUrl = (newPage: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k !== 'page') sp.set(k, v as string);
    });
    sp.set('page', newPage.toString());
    return `/records?${sp.toString()}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-sm">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AquaWatch AI</h1>
                <p className="text-sm text-gray-500">Water Health Monitoring Records</p>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hidden md:inline flex items-center gap-2"
          >
            ← Back to Map
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Records Found</p>
              <p className="text-2xl font-bold text-gray-900">{data.total}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">{criticalCount} <span className="text-sm font-normal text-gray-500">on this page</span></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">High Anomalies</p>
              <p className="text-2xl font-bold text-gray-900">{highCount} <span className="text-sm font-normal text-gray-500">on this page</span></p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse shadow-sm" />}>
          <RecordSearchFilters filterOptions={filterOptions} totalResults={data.total} />
        </Suspense>

        {/* Records Grid or Empty State */}
        {data.total === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
              <FileWarning className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No monitoring records found</h3>
            <p className="text-gray-500 mb-8 max-w-md">
              We couldn't find any records matching your current filter criteria. Try removing some filters or adjusting your search term.
            </p>
            <Link
              href="/records"
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.records.map((record) => (
                <RecordCard key={record.record_id} record={record} />
              ))}
            </div>

            {/* Pagination Controls */}
            {data.total_pages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500">
                  Showing page <span className="font-medium text-gray-900">{data.page}</span> of <span className="font-medium text-gray-900">{data.total_pages}</span>
                </div>
                <div className="flex items-center gap-2">
                  {data.page > 1 ? (
                    <Link
                      href={buildPageUrl(data.page - 1)}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Link>
                  ) : (
                    <button disabled className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                  )}

                  {data.page < data.total_pages ? (
                    <Link
                      href={buildPageUrl(data.page + 1)}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button disabled className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
