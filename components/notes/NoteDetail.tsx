"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  Download,
  FileText,
  Share2,
  Star,
  Tags,
  Users
} from 'lucide-react';

interface NoteDetailProps {
  id: string;
}

export default function NoteDetail({ id }: NoteDetailProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [mdxContent, setMdxContent] = useState(`# Physics Lecture Notes - Quantum Mechanics

## Overview
Today's lecture covered the fundamental principles of quantum mechanics, focusing on wave-particle duality and the implications of quantum theory.

## Key Concepts

### 1. Wave-Particle Duality
- Light exhibits properties of both waves and particles
- De Broglie wavelength: λ = h/p
- Double-slit experiment demonstrates wave behavior

### 2. Quantum States
- Superposition principle
- Quantum entanglement
- Measurement problem

### 3. Applications
- Quantum computing
- Quantum cryptography
- Quantum sensors

## Questions & Discussion Points
1. How does quantum tunneling work?
2. What are the implications of quantum entanglement?
3. How do quantum computers utilize superposition?

## Additional Resources
- [Quantum Mechanics Textbook, Chapter 5]
- [Online Simulation Tools]
- [Research Papers]`);

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Physics Lecture Notes #{id}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsStarred(!isStarred)}
          >
            <Star
              className={`h-5 w-5 ${
                isStarred ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button className="btn-primary">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Textarea
                value={mdxContent}
                onChange={(e) => setMdxContent(e.target.value)}
                className="min-h-[60vh] font-mono"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Note Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">April 5, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Modified</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Word Count</p>
                    <p className="text-sm text-muted-foreground">
                      {mdxContent.split(' ').length} words
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Shared With</p>
                    <p className="text-sm text-muted-foreground">3 people</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tags className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tags</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                        Physics
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                        Quantum
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                        Lecture
                      </span>
                    </div>
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
                  Generate Summary
                </Button>
                <Button className="w-full" variant="outline">
                  Create Flashcards
                </Button>
                <Button className="w-full" variant="outline">
                  Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Related Notes</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((note) => (
                  <div
                    key={note}
                    className="p-3 rounded-lg bg-muted hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium">Physics Lecture #{note}</h3>
                    <p className="text-sm text-muted-foreground">
                      April {note}, 2024
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