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

export default async function SessionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  return <SessionDetail id={id} />;
}