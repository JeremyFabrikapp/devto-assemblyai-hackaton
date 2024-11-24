"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FastForward,
  FileText,
  Pause,
  Play,
  Rewind,
  Volume2,
  AudioWaveform
} from 'lucide-react';

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

interface SessionDetailProps {
  id: string;
}

export default function SessionDetail({ id }: SessionDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [activeTab, setActiveTab] = useState('transcript');

  const transcript: TranscriptSegment[] = [
    {
      id: 1,
      speaker: "Professor",
      text: "Today we'll be discussing the fundamental principles of quantum mechanics.",
      timestamp: "00:00:00",
      confidence: 0.98
    },
    {
      id: 2,
      speaker: "Professor",
      text: "Let's start with the concept of wave-particle duality.",
      timestamp: "00:00:15",
      confidence: 0.95
    },
    {
      id: 3,
      speaker: "Student 1",
      text: "Could you explain how this relates to the double-slit experiment?",
      timestamp: "00:00:30",
      confidence: 0.92
    }
  ];

  const generatedNotes: GeneratedNote[] = [
    {
      id: 1,
      instruction: "Simplified Explanation",
      content: "Quantum mechanics is about how very tiny things behave. One key idea is that things like light can act both as waves and particles, which is different from what we see in our everyday world. Scientists discovered this through experiments like the double-slit experiment.",
      timestamp: "00:00:15"
    },
    {
      id: 2,
      instruction: "Spanish Translation",
      content: "Hoy discutiremos los principios fundamentales de la mecánica cuántica. Comencemos con el concepto de dualidad onda-partícula. ¿Podrías explicar cómo se relaciona esto con el experimento de doble rendija?",
      timestamp: "00:00:30"
    },
    {
      id: 3,
      instruction: "Expert Context",
      content: "The discussion of wave-particle duality introduces the Copenhagen interpretation and the mathematical foundations of quantum mechanics through the wave function. The double-slit experiment demonstrates quantum superposition and the collapse of the wave function upon measurement.",
      timestamp: "00:00:45"
    }
  ];

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Physics Lecture #{id}</h1>
          <p className="text-muted-foreground">Recorded on April 5, 2024</p>
        </div>
        <Button className="btn-primary">
          <Download className="mr-2 h-4 w-4" />
          Download Recording
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio Player and Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              {/* Waveform Visualization */}
              <div className="h-32 mb-4 bg-muted rounded-lg flex items-center justify-center">
                <AudioWaveform className="h-20 w-20 text-muted-foreground" />
              </div>

              {/* Audio Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon">
                    <Rewind className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    className="w-20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <FastForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={3600}
                    step={1}
                    className="flex-1"
                    onValueChange={(value) => setCurrentTime(value[0])}
                  />
                  <span className="text-sm">01:00:00</span>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={volume}
                    max={100}
                    className="w-28"
                    onValueChange={setVolume}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript and Generated Notes */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="transcript" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Transcript
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

        {/* Session Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Session Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">1 hour</p>
                </div>
                <div>
                  <p className="text-sm font-medium">File Size</p>
                  <p className="text-sm text-muted-foreground">125 MB</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Audio Quality</p>
                  <p className="text-sm text-muted-foreground">High (320kbps)</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Speakers</p>
                  <p className="text-sm text-muted-foreground">2 identified</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Generated Notes</p>
                  <p className="text-sm text-muted-foreground">{generatedNotes.length} versions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Edit Transcript
                </Button>
                <Button className="w-full" variant="outline">
                  Generate New Note
                </Button>
                <Button className="w-full" variant="outline">
                  Share Recording
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Related Sessions</h2>
              <div className="space-y-3">
                {[2, 3, 4].map((session) => (
                  <div
                    key={session}
                    className="p-3 rounded-lg bg-muted hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium">Physics Lecture #{session}</h3>
                    <p className="text-sm text-muted-foreground">
                      April {session}, 2024
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}