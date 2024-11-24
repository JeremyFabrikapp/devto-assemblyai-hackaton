"use client";

import { Card, CardContent } from '@/components/ui/card';

interface TranscriptSegment {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

interface SessionInfoProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: TranscriptSegment[];
  formatDuration: (seconds: number) => string;
}

export default function SessionInfo({
  isRecording,
  isPaused,
  duration,
  transcript,
  formatDuration
}: SessionInfoProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Session Info</h2>
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
            <span className="text-muted-foreground">Speakers: </span>
            {transcript.reduce((acc, curr) => {
              if (!acc.includes(curr.speaker)) acc.push(curr.speaker);
              return acc;
            }, [] as string[]).length} detected
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Words: </span>
            {transcript.reduce((acc, curr) => acc + curr.text.split(' ').length, 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}