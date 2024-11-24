import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NotesPage() {
  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Link href="/notes/new">
          <Button className="btn-primary">New Note</Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <div className="my-4">
          <Input
            placeholder="Search notes..."
            className="max-w-sm"
          />
        </div>

        <TabsContent value="all">
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((note) => (
              <Card key={note}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Physics Notes #{note}</h3>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last edited on April {note}, 2024
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/notes/${note}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button variant="outline" size="sm">Share</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}