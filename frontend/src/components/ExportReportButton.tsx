"use client";
import { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getReportUrl } from '@/lib/api';

export default function ExportReportButton({ recordId }: { recordId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleExport = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(getReportUrl(recordId));
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `AquaWatch_Report_${recordId}_${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setErrorMsg(message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow transition whitespace-nowrap ${
        status === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
        status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
        'bg-blue-600 hover:bg-blue-700 text-white'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'success' && <CheckCircle className="w-4 h-4" />}
      {status === 'error' && <AlertCircle className="w-4 h-4" />}
      {status === 'idle' && <Download className="w-4 h-4" />}
      {status === 'loading' ? 'Generating...' :
       status === 'success' ? 'Downloaded!' :
       status === 'error' ? errorMsg :
       'Export Report (PDF)'}
    </button>
  );
}
