"use client";

import { useState, useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/sessions.store';
import { SessionHeader } from './SessionHeader';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptAndNotes } from './TranscriptAndNotes';
import { SessionInfo } from './SessionInfo';
import { NoteGenerator } from './NoteGenerator';
import { QuickActions } from './QuickActions';
// import { useAssembly } from '@/hooks/use-assembly';
// import { transcribeAudio } from '@/provider/assemblyai/api';

interface SessionDetailProps {
  id: string;
}

interface GeneratedNote {
  id: number;
  instruction: string;
  content: string;
  timestamp: string;
}

// Mock session data
const mockSession = {
  id: '1',
  title: 'Mock Session',
  audioFile: 'http://localhost:3000/audio/sports_injuries.mp3',
  transcript: [
    { id: 1, speaker: 'Speaker 1', text: 'This is a mock transcript.', timestamp: '00:00:00' },
    { id: 2, speaker: 'Speaker 2', text: 'It simulates a real session.', timestamp: '00:00:05' },
  ],
};

export default function SessionDetail({ id }: SessionDetailProps) {
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [transcript, setTranscript] = useState(mockSession.transcript);
  const session = useSessionStore((state) => state.sessions.find((s) => s.id === id)) || mockSession;
  // const { transcribeAudio, isLoading, error } = useAssembly();

  // useEffect(() => {
  //   // const fetchTranscript = async () => {
  //   //   try {
  //   //     const result = await transcribeAudio(session.audioFile);
  //   //     if (result && result.words) {
  //   //       const formattedTranscript = result.words.map((word, index) => ({
  //   //         id: index,
  //   //         speaker: word.speaker || 'Unknown',
  //   //         text: word.text,
  //   //         timestamp: `${word.start}`
  //   //       }));
  //   //       setTranscript(formattedTranscript);
  //   //     }
  //   //   } catch (error) {
  //   //     console.error('Error fetching transcript:', error);
  //   //   }
  //   // };

  //   // fetchTranscript();
  // }, [session.audioFile, transcribeAudio]);

  // if (isLoading) {
  //   return <div>Loading transcript...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  const handleGenerateNote = (instruction: string) => {
    // This is a placeholder. In a real application, you would call an API to generate the note.
    const newNote: GeneratedNote = {
      id: Date.now(),
      instruction,
      content: `Generated content for "${instruction}"`,
      timestamp: new Date().toISOString(),
    };
    setGeneratedNotes([...generatedNotes, newNote]);
  };

  return (
    <div className="container mx-auto py-8">
      <SessionHeader id={id} />
      
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <AudioPlayer audioFile={session.audioFile} />
          <TranscriptAndNotes 
            transcript={transcript} 
            generatedNotes={generatedNotes} 
          />
        </div>
        
        <div className="space-y-8">
          <SessionInfo />
          <NoteGenerator onGenerateNote={handleGenerateNote} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}