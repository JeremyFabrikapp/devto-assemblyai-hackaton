"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserNotes } from '@/app/actions/database'; // Import the function to retrieve notes
import { useEffect, useState } from 'react';
import { Note } from '@/types/database';

const NoteList = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const userId = '74049d58-7768-47cb-aafe-7765a3bc72ba'; // Replace with actual user ID logic
      const fetchedNotes = await getUserNotes(userId);
      setNotes(fetchedNotes);
    };

    fetchNotes();
  }, []);

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
            {notes.map(note => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{note.title}</h3>
                    <span className="text-sm text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last edited on {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/notes/${note.id}`}>
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

export default NoteList;