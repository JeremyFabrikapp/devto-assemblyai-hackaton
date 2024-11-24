"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Save,
  Settings,
  Volume2,
  Waveform,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AudioVisualizer from './AudioVisualizer';
import TranscriptView from './TranscriptView';
import RecordingControls from './RecordingControls';
import RecordingSettings from './RecordingSettings';
import SessionInfo from './SessionInfo';
import NoteGeneration from './NoteGeneration';

interface TranscriptSegment {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

interface GeneratedNote {
  id: number;
  instruction: string;
  content: string;
  timestamp: string;
}

export default function RecordingInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [activeNoteTab, setActiveNoteTab] = useState<string>('transcript');
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
        // Simulate real-time transcription
        if (duration % 5 === 0) {
          setTranscript((prev) => [
            ...prev,
            {
              id: Date.now(),
              speaker: "Speaker " + ((prev.length % 2) + 1),
              text: "This is a simulated transcription segment " + (prev.length + 1),
              timestamp: formatDuration(duration),
              confidence: 0.95
            }
          ]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, duration]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    toast({
      title: "Recording Started",
      description: "Your session is now being recorded and transcribed.",
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    toast({
      title: "Recording Stopped",
      description: "Your session has been saved.",
    });
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Recording Resumed" : "Recording Paused",
      description: isPaused ? "Continue capturing audio." : "Recording temporarily paused.",
    });
  };

  const getFullTranscript = () => {
    return transcript.map(segment => segment.text).join(' ');
  };

  const handleNoteGenerated = (instruction: string, content: string) => {
    const newNote = {
      id: Date.now(),
      instruction,
      content,
      timestamp: formatDuration(duration)
    };
    setGeneratedNotes(prev => [...prev, newNote]);
    setActiveNoteTab(`note-${newNote.id}`);
    toast({
      title: "Note Generated",
      description: `Generated note with instruction: ${instruction}`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Audio Visualization */}
        <AudioVisualizer isRecording={isRecording} />

        {/* Transcript and Generated Notes */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeNoteTab} onValueChange={setActiveNoteTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="transcript" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Live Transcript
                  </TabsTrigger>
                  {generatedNotes.map((note) => (
                    <TabsTrigger key={note.id} value={`note-${note.id}`} className="flex-1">
                      {note.instruction}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="transcript">
                <ScrollArea className="h-[500px]">
                  {transcript.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      Transcript will appear here when recording starts...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transcript.map((segment, index) => (
                        <div key={segment.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{segment.speaker}</span>
                              <span className="text-sm text-muted-foreground">
                                {segment.timestamp}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {(segment.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <p className="text-sm">{segment.text}</p>
                          {index < transcript.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {generatedNotes.map((note) => (
                <TabsContent key={note.id} value={`note-${note.id}`}>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{note.instruction}</h3>
                        <span className="text-sm text-muted-foreground">
                          Generated at {note.timestamp}
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                        {note.content}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Settings */}
      <div className="space-y-6">
        {/* Recording Controls */}
        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          onPause={handlePauseRecording}
        />

        {/* Note Generation */}
        <NoteGeneration 
          isRecording={isRecording}
          transcript={getFullTranscript()}
          onNoteGenerated={handleNoteGenerated}
        />

        {/* Settings */}
        <RecordingSettings />

        {/* Session Info */}
        <SessionInfo
          isRecording={isRecording}
          isPaused={isPaused}
          duration={duration}
          transcript={transcript}
          formatDuration={formatDuration}
        />
      </div>
    </div>
  );
}