"use client";

import RecordingInterface from '@/components/recording/RecordingInterface';

export default function RecordPage() {
  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Record Session</h1>
          <p className="text-muted-foreground">Capture and transcribe audio in real-time</p>
        </div>
      </div>
      <RecordingInterface />
    </div>
  );
}