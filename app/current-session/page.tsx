"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FileText, Clock, Mic } from 'lucide-react';

export default function CurrentSessionPage() {
  const [mdxContent, setMdxContent] = useState(`# Physics Lecture - April 5, 2024

## Key Topics
- Quantum Mechanics Introduction
- Wave-Particle Duality
- Schrödinger's Equation

## Notes
Today's lecture covered the fundamental principles of quantum mechanics...

### Wave-Particle Duality
- Light exhibits both wave and particle properties
- De Broglie wavelength equation: λ = h/p
- Experimental evidence from double-slit experiment

### Schrödinger's Equation
- Fundamental equation of quantum mechanics
- Describes how quantum state changes with time
- Applications in atomic physics`);

  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState("00:45:30");

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Current Session</h1>
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse"></div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
          <Button className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MDX Editor */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Textarea
              value={mdxContent}
              onChange={(e) => setMdxContent(e.target.value)}
              className="min-h-[60vh] font-mono"
              placeholder="Start taking notes..."
            />
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Session Status</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Recording Status</p>
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Active" : "Stopped"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Note Length</p>
                    <p className="text-sm text-muted-foreground">
                      {mdxContent.split(' ').length} words
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Export as PDF
                </Button>
                <Button className="w-full" variant="outline">
                  Share Notes
                </Button>
                <Button className="w-full" variant="outline">
                  End Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}