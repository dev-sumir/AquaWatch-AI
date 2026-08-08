const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchSites() {
  try {
    const res = await fetch(`${API_URL}/sites`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch sites");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchSiteDetails(id: number) {
  const res = await fetch(`${API_URL}/sites/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch site details");
  return res.json();
}

export async function analyzeCoordinate(lat: number, lon: number) {
  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon }),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to dynamically analyze site");
  return res.json();
}

// ============================================================
// Health Records API (T219 Bounty)
// ============================================================

export interface HealthRecord {
  id: number;
  record_id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  record_date: string;
  condition_type?: string;
  severity?: string;
  status?: string;
  department?: string;
  detected_anomaly?: string;
  spectral_indicators?: string;
  recommendations?: string;
  notes?: string;
  ndwi_value?: number;
  ndvi_value?: number;
  site_id?: number;
  attachment_name?: string;
  attachment_type?: string;
  attachment_url?: string;
  attachment_original_filename?: string;
  attachment_size_bytes?: number;
  attachment_mime_type?: string;
  has_attachment?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HealthRecordsResponse {
  records: HealthRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FilterOptions {
  departments: string[];
  conditions: string[];
  severities: string[];
}

export async function fetchHealthRecords(params: Record<string, string> = {}): Promise<HealthRecordsResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) searchParams.set(key, val);
  });
  
  if (!searchParams.has('page')) searchParams.set('page', '1');
  if (!searchParams.has('limit')) searchParams.set('limit', '9'); // 9 cards per page looks good in a 3-col grid

  const res = await fetch(`${API_URL}/health-records?${searchParams.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch health records");
  return res.json();
}

export async function fetchHealthRecord(recordId: string): Promise<HealthRecord> {
  const res = await fetch(`${API_URL}/health-records/${recordId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch health record");
  return res.json();
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await fetch(`${API_URL}/health-records/filters`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch filter options");
  return res.json();
}

export async function uploadAttachment(recordId: string, file: File, name: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('attachment_name', name);
  const res = await fetch(`${API_URL}/health-records/${recordId}/attachment`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function linkAttachment(recordId: string, url: string, name: string) {
  const formData = new FormData();
  formData.append('url', url);
  formData.append('attachment_name', name);
  const res = await fetch(`${API_URL}/health-records/${recordId}/attachment`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Link failed' }));
    throw new Error(err.detail || 'Link failed');
  }
  return res.json();
}

export async function removeAttachment(recordId: string) {
  const res = await fetch(`${API_URL}/health-records/${recordId}/attachment`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Failed to remove attachment");
  return res.json();
}

export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace('/api', '');
}

export function getFullAttachmentUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${getBackendBaseUrl()}${url}`;
}

export function getReportUrl(recordId: string) {
  return `${API_URL}/health-records/${recordId}/report`;
}
