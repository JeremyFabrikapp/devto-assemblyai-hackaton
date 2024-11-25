
import SessionDetail from "@/components/sessions/SessionDetail";
import { getSessionById } from "@/app/actions/database";

// Generate static params for build time
export function generateStaticParams() {
  return [
    { id: '074565d3-37b7-4389-85c0-d3388482242b' },
    { id: 'f79d4829-0394-4bc1-9de8-2b15850f392a' },
    // { id: '3' },
    // { id: '4' },
    // { id: '5' }
  ];
}

export default async function SessionPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSessionById(id);

  if (!session) {
    return <div>Error: Session not found</div>;
  }

  return <SessionDetail session={session}/>;
}
