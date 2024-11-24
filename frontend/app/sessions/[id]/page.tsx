import SessionDetail from '@/components/sessions/SessionDetail';

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

export default async function SessionPage({ params }: { params: { id: string } }) {
  const id = await params.id;
  return <SessionDetail id={id} />;
}