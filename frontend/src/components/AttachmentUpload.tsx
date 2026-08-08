"use client";
import { useState, useRef, useCallback } from 'react';
import { Upload, Link2, X, FileText, Image as ImageIcon, ExternalLink, Loader2, CheckCircle, AlertCircle, Trash2, RefreshCw, Paperclip } from 'lucide-react';
import { uploadAttachment, linkAttachment, removeAttachment, getFullAttachmentUrl } from '@/lib/api';

interface AttachmentUploadProps {
  recordId: string;
  currentAttachment?: {
    name?: string;
    type?: string;
    url?: string;
    originalFilename?: string;
    sizeBytes?: number;
    mimeType?: string;
  } | null;
  onUpdate: () => void;
}

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_DOC_EXTS = ['.pdf', '.doc', '.docx', '.csv', '.xlsx', '.txt'];
const ALL_ALLOWED = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_DOC_EXTS];
const MAX_SIZE = 10 * 1024 * 1024;

export default function AttachmentUpload({ recordId, currentAttachment, onUpdate }: AttachmentUploadProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [tab, setTab] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [urlValue, setUrlValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState(false);

  const hasAttachment = currentAttachment && currentAttachment.url;

  const validateFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALL_ALLOWED.includes(ext)) return `File type ${ext} not supported. Allowed: ${ALL_ALLOWED.join(', ')}`;
    if (f.size > MAX_SIZE) return `File too large (${(f.size / (1024 * 1024)).toFixed(1)}MB). Maximum: 10MB`;
    return null;
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const err = validateFile(droppedFile);
      if (err) { setErrorMsg(err); setStatus('error'); return; }
      setFile(droppedFile);
      if (!nameValue) setNameValue(droppedFile.name);
      setErrorMsg('');
      setStatus('idle');
    }
  }, [nameValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const err = validateFile(selected);
      if (err) { setErrorMsg(err); setStatus('error'); return; }
      setFile(selected);
      if (!nameValue) setNameValue(selected.name);
      setErrorMsg('');
      setStatus('idle');
    }
  };

  const handleSubmit = async () => {
    setStatus('uploading');
    setErrorMsg('');
    try {
      if (tab === 'file') {
        if (!file) { setErrorMsg('Please select a file'); setStatus('error'); return; }
        await uploadAttachment(recordId, file, nameValue || file.name);
      } else {
        if (!urlValue) { setErrorMsg('Please enter a URL'); setStatus('error'); return; }
        if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(urlValue)) {
          setErrorMsg('Invalid URL. Must start with http:// or https://'); setStatus('error'); return;
        }
        await linkAttachment(recordId, urlValue, nameValue || urlValue);
      }
      setStatus('success');
      setShowPanel(false);
      setFile(null);
      setUrlValue('');
      setNameValue('');
      onUpdate();
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setErrorMsg(message);
      setStatus('error');
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeAttachment(recordId);
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove attachment';
      setErrorMsg(message);
      setStatus('error');
    } finally {
      setRemoving(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  // Current attachment preview
  if (hasAttachment && !showPanel) {
    const fullUrl = getFullAttachmentUrl(currentAttachment!.url!);
    const isImage = currentAttachment!.type === 'image';
    const isUrl = currentAttachment!.type === 'url';

    return (
      <div className="space-y-4">
        {/* Attachment Preview */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          {isImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fullUrl} alt={currentAttachment!.name || 'Attachment'} className="w-full max-h-80 object-contain bg-gray-100" />
              <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 truncate">{currentAttachment!.name}</span>
                {currentAttachment!.sizeBytes && <span className="text-xs text-gray-400 ml-auto">{formatSize(currentAttachment!.sizeBytes)}</span>}
              </div>
            </div>
          ) : isUrl ? (
            <div className="p-4 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{currentAttachment!.name}</p>
                <a href={currentAttachment!.url!} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                  {currentAttachment!.url}
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center gap-3 bg-white">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{currentAttachment!.name}</p>
                <p className="text-xs text-gray-500">
                  {currentAttachment!.originalFilename} {currentAttachment!.sizeBytes ? `· ${formatSize(currentAttachment!.sizeBytes)}` : ''}
                </p>
              </div>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-medium hover:underline shrink-0">
                Open
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setShowPanel(true); setStatus('idle'); setErrorMsg(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Replace Attachment
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Remove
          </button>
          {(isImage || currentAttachment!.type === 'document') && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Evidence
            </a>
          )}
        </div>
      </div>
    );
  }

  // Upload panel or Add button
  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer"
      >
        <Paperclip className="w-5 h-5" />
        <span className="font-medium">Add Supporting Evidence</span>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            tab === 'file' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4" /> Upload File
        </button>
        <button
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
            tab === 'url' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 className="w-4 h-4" /> Link URL
        </button>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'file' ? (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' :
                file ? 'border-green-300 bg-green-50' :
                'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              {file ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-green-700">{file.name}</p>
                  <p className="text-xs text-green-600">{formatSize(file.size)} · Click to change</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">Images, PDFs, documents up to 10MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept={ALL_ALLOWED.join(',')} onChange={handleFileSelect} className="hidden" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">External URL</label>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://example.com/report.pdf"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Attachment Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachment Name</label>
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="e.g. Satellite Anomaly Image"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => { setShowPanel(false); setFile(null); setUrlValue(''); setErrorMsg(''); setStatus('idle'); }}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === 'uploading' || (tab === 'file' ? !file : !urlValue)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'uploading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : tab === 'file' ? (
              <><Upload className="w-4 h-4" /> Upload</>
            ) : (
              <><Link2 className="w-4 h-4" /> Link</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
