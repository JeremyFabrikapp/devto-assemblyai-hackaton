import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface SessionHeaderProps {
  id: string;
}

export function SessionHeader({ id }: SessionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Session #{id}</h1>
      <div className="flex gap-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button className="btn-primary">
          Share Session
        </Button>
      </div>
    </div>
  );
}