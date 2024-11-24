import NoteDetail from '@/components/notes/NoteDetail';

// Generate static params for build time
export function generateStaticParams() {
  // In a real app, this would come from your data source
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function NotePage({ params }: { params: { id: string } }) {
  return <NoteDetail id={params.id} />;
}