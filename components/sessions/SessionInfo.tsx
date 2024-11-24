import { Card, CardContent } from '@/components/ui/card';

export function SessionInfo() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Session Info</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Duration: </span>
            45:30
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Date: </span>
            April 5, 2024
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Speakers: </span>
            2 detected
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Words: </span>
            1,234
          </p>
        </div>
      </CardContent>
    </Card>
  );
}