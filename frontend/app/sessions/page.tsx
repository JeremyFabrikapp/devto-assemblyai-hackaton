import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SessionsPage() {
  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <Link href="/record">
          <Button className="btn-primary">New Session</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search sessions..."
          className="max-w-sm"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((session) => (
          <Card key={session}>
            <CardContent className="flex items-center p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Physics Lecture #{session}</h3>
                  <span className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                    Completed
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Recorded on April {session}, 2024</p>
                <p className="text-sm">Duration: 45 minutes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Download</Button>
                <Link href={`/sessions/${session}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <Button variant="outline" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}