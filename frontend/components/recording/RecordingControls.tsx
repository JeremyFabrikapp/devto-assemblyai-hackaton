"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Pause, Play, Save } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

export default function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause
}: RecordingControlsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Button
            className={`w-full ${isRecording ? "bg-destructive" : ""}`}
            size="lg"
            onClick={isRecording ? onStop : onStart}
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
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={onPause}
              >
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
              <Button className="w-full" variant="outline" size="lg">
                <Save className="mr-2 h-5 w-5" />
                Save Session
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}