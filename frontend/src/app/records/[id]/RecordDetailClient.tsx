"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Tag, Activity, Building2, Droplets, FileText, AlertTriangle, CheckCircle, Info, AlertCircle, Clock, Paperclip } from 'lucide-react';
import AttachmentUpload from '@/components/AttachmentUpload';
import ExportReportButton from '@/components/ExportReportButton';
import type { HealthRecord } from '@/lib/api';

const severityConfig: Record<string, { bg: string; text: string; border: string; gradient: string; icon: React.ComponentType<{ className?: string }> }> = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', gradient: 'from-red-500 to-red-600', icon: AlertCircle },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600', icon: AlertTriangle },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600', icon: Info },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
};

export default function RecordDetailClient({ record }: { record: HealthRecord }) {
  const router = useRouter();
  const handleUpdate = () => router.refresh();

  const sev = severityConfig[record.severity || ''] || severityConfig['Low'];
  const SevIcon = sev.icon;
  const formattedDate = record.record_date
    ? new Date(record.record_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const formattedTime = record.record_date
    ? new Date(record.record_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-20 shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <Link href="/records" className="text-gray-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{record.title}</h1>
            <p className="text-xs text-gray-500 font-mono">{record.record_id}</p>
          </div>
        </div>
        <ExportReportButton recordId={record.record_id} />
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Severity Card */}
          <div className={`rounded-2xl border ${sev.border} ${sev.bg} p-6 text-center`}>
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${sev.gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <SevIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-2xl font-black ${sev.text}`}>{record.severity || 'N/A'}</h3>
            <p className="text-sm text-gray-500 mt-1">Anomaly Severity</p>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-semibold text-gray-900">{record.status || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-semibold text-gray-900">{record.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900">{record.location}</p>
                {record.latitude && record.longitude && (
                  <p className="text-xs text-gray-400 font-mono">{record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                {formattedTime && <p className="text-xs text-gray-400">{formattedTime}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Condition Type</p>
                <p className="text-sm font-semibold text-gray-900">{record.condition_type || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Record ID</p>
                <p className="text-sm font-semibold text-gray-900 font-mono">{record.record_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detected Anomaly */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Detected Anomaly
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {record.detected_anomaly || 'No anomaly details recorded.'}
            </p>
          </div>

          {/* Spectral Indicators */}
          {(record.ndwi_value != null || record.ndvi_value != null || record.spectral_indicators) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" /> Spectral / Environmental Indicators
              </h2>
              <div className="flex gap-6 mb-3 flex-wrap">
                {record.ndwi_value != null && (
                  <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">NDWI</p>
                    <p className="text-xl font-bold text-blue-900">{record.ndwi_value.toFixed(4)}</p>
                  </div>
                )}
                {record.ndvi_value != null && (
                  <div className="px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-medium">NDVI</p>
                    <p className="text-xl font-bold text-emerald-900">{record.ndvi_value.toFixed(4)}</p>
                  </div>
                )}
              </div>
              {record.spectral_indicators && (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{record.spectral_indicators}</p>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Recommendations
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {record.recommendations || 'No recommendations provided.'}
            </p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Notes</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {record.notes || 'No additional notes.'}
            </p>
          </div>

          {/* Supporting Evidence */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-gray-500" /> Supporting Evidence
            </h2>
            <AttachmentUpload
              recordId={record.record_id}
              currentAttachment={record.has_attachment ? {
                name: record.attachment_name,
                type: record.attachment_type,
                url: record.attachment_url,
                originalFilename: record.attachment_original_filename,
                sizeBytes: record.attachment_size_bytes,
                mimeType: record.attachment_mime_type,
              } : null}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
