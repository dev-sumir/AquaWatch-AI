"use client";
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function VerdictCard({ verdictText, severity }: { verdictText: string, severity: string }) {
  const getIcon = () => {
    if (severity === 'High') return <AlertTriangle className="w-8 h-8 text-red-500" />;
    if (severity === 'Moderate') return <Info className="w-8 h-8 text-amber-500" />;
    return <CheckCircle className="w-8 h-8 text-emerald-500" />;
  };

  const getColors = () => {
    if (severity === 'High') return 'bg-red-50 border-red-100 text-red-900';
    if (severity === 'Moderate') return 'bg-amber-50 border-amber-100 text-amber-900';
    return 'bg-emerald-50 border-emerald-100 text-emerald-900';
  };

  return (
    <div className={`w-full h-full p-6 rounded-xl border flex flex-col items-center justify-center text-center gap-4 ${getColors()}`}>
      <div className="p-3 bg-white rounded-full shadow-sm">
        {getIcon()}
      </div>
      <p className="text-lg font-medium leading-relaxed max-w-sm">{verdictText}</p>
    </div>
  );
}
