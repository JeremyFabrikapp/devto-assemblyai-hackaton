"use client";
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
import { useSessions } from "@/hooks/use-sessions";

export default function SessionsPage() {
  const userId = "74049d58-7768-47cb-aafe-7765a3bc72ba"; // Replace with actual user ID
  const { sessions, loading, error } = useSessions(userId);

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="flex items-center p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{session.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${session.status === 'completed' ? 'bg-secondary text-secondary-foreground' : 'bg-warning text-warning-foreground'}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Recorded on {new Date(session.created_at).toLocaleDateString()}</p>
                <p className="text-sm">Duration: 00 minutes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Download</Button>
                <Link href={`/sessions/${session.id}`}>
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