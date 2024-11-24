"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Download,
  FastForward,
  Pause,
  Play,
  Rewind,
  Volume2,
  Waveform
} from 'lucide-react';

interface TranscriptSegment {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

interface SessionDetailProps {
  id: string;
}

export default function SessionDetail({ id }: SessionDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([75]);

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
        {/* Audio Player and Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              {/* Waveform Visualization */}
              <div className="h-32 mb-4 bg-muted rounded-lg flex items-center justify-center">
                <Waveform className="h-20 w-20 text-muted-foreground" />
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

          {/* Transcript */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Transcript</h2>
              <ScrollArea className="h-[400px] pr-4">
                {transcript.map((segment, index) => (
                  <div key={segment.id} className="mb-4">
                    <div className="flex items-center justify-between mb-1">
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
                    {index < transcript.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </ScrollArea>
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
                  Generate Summary
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