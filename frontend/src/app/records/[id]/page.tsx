import { fetchHealthRecord } from '@/lib/api';
import { notFound } from 'next/navigation';
import RecordDetailClient from './RecordDetailClient';

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let record;
  try {
    record = await fetchHealthRecord(id);
  } catch {
    return notFound();
  }

  if (!record) return notFound();

  return <RecordDetailClient record={record} />;
}
