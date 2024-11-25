import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserNotes } from '@/app/actions/database'; // Import the function to retrieve notes
import { Metadata } from 'next';
import NoteList from '@/components/notes/NoteList';

export const metadata: Metadata = {
  title: 'Notes',
};

export default async function NotesPage() {
  const userId = 'currentUserId'; // Replace with actual user ID logic

  return (
   <NoteList />
  );
}