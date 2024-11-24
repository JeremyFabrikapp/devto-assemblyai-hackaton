"use client";

import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { AudioWaveform } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export default function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-32 mb-4 bg-muted rounded-lg flex items-center justify-center">
          <AudioWaveform className={`h-20 w-20 text-muted-foreground ${isRecording ? 'animate-pulse' : ''}`} />
        </div>
      </CardContent>
    </Card>
  );
}