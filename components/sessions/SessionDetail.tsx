"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FastForward,
  FileText,
  Pause,
  Play,
  Rewind,
  Volume2,
  AudioWaveform,
  Sparkles
} from 'lucide-react';
import { useSessionStore } from '@/lib/stores/sessions.store';

interface SessionDetailProps {
  id: string;
}

interface TranscriptSegment {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
}

interface GeneratedNote {
  id: number;
  instruction: string;
  content: string;
  timestamp: string;
}

export default function SessionDetail({ id }: SessionDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [activeTab, setActiveTab] = useState('transcript');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const session = useSessionStore((state) => state.getSession(id));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (session && session.audioFile) {
      audioRef.current = new Audio(session.audioFile);
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('ended', () => {});
      }
    };
  }, [session]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
      setVolume(newVolume);
    }
  };

  useEffect(() => {
    if (session && session.audioFile) {
      console.log('Audio file URL:', session.audioFile);
      // You can perform additional actions here if needed
    }
  }, [session]);

  const transcript: TranscriptSegment[] = [
    {
      id: 1,
      speaker: 'Speaker 1',
      text: 'This is a sample transcript segment.',
      timestamp: '00:00:05'
    },
    // Add more sample transcript segments as needed
  ];

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const presetInstructions = [
    { value: 'translate-es', label: 'Translate to Spanish' },
    { value: 'translate-fr', label: 'Translate to French' },
    { value: 'simplify', label: 'Simplify for Beginners' },
    { value: 'expert', label: 'Add Expert Context' },
    { value: 'summarize', label: 'Summarize Key Points' },
    { value: 'academic', label: 'Academic Format' },
    { value: 'bullets', label: 'Convert to Bullet Points' },
    { value: 'questions', label: 'Generate Study Questions' }
  ];

  const handleGenerateNote = () => {
    const newNote = {
      id: generatedNotes.length + 1,
      instruction: customInstruction,
      content: `Generated note based on instruction: ${customInstruction}\n\nThis is a sample generated content based on the transcript...`,
      timestamp: formatTime(currentTime)
    };
    setGeneratedNotes([...generatedNotes, newNote]);
    setActiveTab(`note-${newNote.id}`);
    setCustomInstruction('');
  };

  return (
    <div className="container pt-24 pb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <AudioWaveform className="h-20 w-20 text-muted-foreground" />
                </div>
                
                <audio
                  ref={audioRef}
                  src={session?.audioFile}
                  onTimeUpdate={() => setCurrentTime(audioRef?.current?.currentTime || 0)}
                  onEnded={() => setIsPlaying(false)}
                />
                
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      if (audioRef?.current) {
                        audioRef.current.currentTime -= 10;
                      }
                    }}
                  >
                    <Rewind className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      if (isPlaying) {
                        audioRef?.current?.pause();
                      } else {
                        audioRef?.current?.play();
                      }
                      setIsPlaying(!isPlaying);
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      if (audioRef?.current) {
                        audioRef.current.currentTime += 10;
                      }
                    }}
                  >
                    <FastForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={volume}
                    onValueChange={(newVolume) => {
                      setVolume(newVolume);
                      if (audioRef?.current) {
                        audioRef.current.volume = newVolume[0] / 100;
                      }
                    }}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript and Notes */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="transcript">
                      <FileText className="h-4 w-4 mr-2" />
                      Transcript
                    </TabsTrigger>
                    {generatedNotes.map((note) => (
                      <TabsTrigger key={note.id} value={`note-${note.id}`}>
                        {note.instruction}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="transcript">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {transcript.map((segment, index) => (
                        <div key={segment.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{segment.speaker}</span>
                              <span className="text-sm text-muted-foreground">
                                {segment.timestamp}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1">{segment.text}</p>
                          {index < transcript.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
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
                        <pre className="whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
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

        <div className="space-y-6">
          {/* Session Info */}
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

          {/* Note Generation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Generate New Note</h2>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preset Instructions</Label>
                  <Select onValueChange={(value) => setCustomInstruction(presetInstructions.find(i => i.value === value)?.label || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instruction" />
                    </SelectTrigger>
                    <SelectContent>
                      {presetInstructions.map((instruction) => (
                        <SelectItem key={instruction.value} value={instruction.value}>
                          {instruction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Instruction</Label>
                  <Textarea
                    placeholder="Enter custom instruction (e.g., 'Explain as if teaching to high school students')"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={!customInstruction}
                  onClick={handleGenerateNote}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Note
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Export as PDF
                </Button>
                <Button className="w-full" variant="outline">
                  Share Transcript
                </Button>
                <Button className="w-full" variant="outline">
                  Delete Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}