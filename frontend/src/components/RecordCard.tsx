"use client";
import Link from 'next/link';
import { MapPin, Calendar, AlertTriangle, CheckCircle, Info, AlertCircle, FileText, Paperclip } from 'lucide-react';

interface RecordCardProps {
  record: {
    record_id: string;
    title: string;
    location: string;
    condition_type?: string;
    severity?: string;
    status?: string;
    record_date: string;
    department?: string;
    has_attachment?: boolean;
  };
}

const severityConfig: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: AlertCircle },
  High: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: AlertTriangle },
  Moderate: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', icon: Info },
  Low: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle },
};

const statusConfig: Record<string, string> = {
  'Active': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Monitoring': 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function RecordCard({ record }: RecordCardProps) {
  const severity = severityConfig[record.severity || ''] || severityConfig['Low'];
  const SeverityIcon = severity.icon;
  const statusClass = statusConfig[record.status || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  const formattedDate = record.record_date
    ? new Date(record.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden group">
      {/* Severity accent bar */}
      <div className={`h-1.5 ${
        record.severity === 'Critical' ? 'bg-red-500' :
        record.severity === 'High' ? 'bg-orange-500' :
        record.severity === 'Moderate' ? 'bg-amber-500' :
        'bg-emerald-500'
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {record.title}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{record.record_id}</p>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${severity.bg} ${severity.text} ${severity.border} shrink-0 ml-3`}>
            <SeverityIcon className="w-3 h-3" />
            {record.severity}
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{record.location}</span>
          </div>
          {record.condition_type && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{record.condition_type}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${statusClass}`}>
              {record.status}
            </span>
            {record.department && (
              <span className="text-xs text-gray-400">{record.department}</span>
            )}
            {record.has_attachment && <Paperclip className="w-3 h-3 text-blue-400" />}
          </div>
          <Link
            href={`/records/${record.record_id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
