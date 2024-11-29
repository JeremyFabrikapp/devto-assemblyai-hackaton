"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Pause, Play, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';



export default function TranscribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

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
    setDuration(0);
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

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Transcription</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-mono">{formatDuration(duration)}</span>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse"></div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcription Area */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <ScrollArea className="h-[60vh]">
              {transcript.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Transcript will appear here...
                </div>
              ) : (
                transcript.map((segment) => (
                  <div key={segment.id} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{segment.speaker}</span>
                      <span className="text-sm text-muted-foreground">
                        {segment.timestamp}
                      </span>
                    </div>
                    <p>{segment.text}</p>
                    <Separator className="mt-4" />
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <Button
                className={isRecording ? "bg-destructive" : ""}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Recording
                  </>
                )}
              </Button>

              {isRecording && (
                <>
                  <Button onClick={handlePauseRecording} variant="outline" size="lg">
                    {isPaused ? (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg">
                    <Save className="mr-2 h-5 w-5" />
                    Save Session
                  </Button>
                </>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold">Session Info</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  {isRecording ? (isPaused ? "Paused" : "Recording") : "Ready"}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Duration: </span>
                  {formatDuration(duration)}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Words: </span>
                  {transcript.reduce((acc, curr) => acc + curr.text.split(' ').length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}