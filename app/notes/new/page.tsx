"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Save, X, AudioWaveform } from 'lucide-react';

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Your voice will be transcribed automatically.",
    });
    // Start duration counter
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Recording Stopped",
      description: "Transcription complete.",
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
    });
  };

  return (
    <div className="container pt-24 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">New Note</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button className="btn-primary" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Audio Recording Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Voice Recording</Label>
                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(duration)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isRecording && (
                    <div className="h-24 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <AudioWaveform className="h-16 w-16 text-muted-foreground animate-pulse" />
                    </div>
                  )}

                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    className="w-full"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Voice Recording
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder={isRecording ? "Content will appear here as you speak..." : "Write your note content here..."}
                    className="min-h-[40vh] font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isRecording}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Note Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <Button className="w-full" variant="outline">
                    Preview Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isRecording && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recording Info</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Status:</span> Recording</p>
                  <p><span className="text-muted-foreground">Duration:</span> {formatDuration(duration)}</p>
                  <p><span className="text-muted-foreground">Words:</span> {content.split(' ').length}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Markdown Tips</h2>
              <div className="space-y-2 text-sm">
                <p># Heading 1</p>
                <p>## Heading 2</p>
                <p>**Bold Text**</p>
                <p>*Italic Text*</p>
                <p>- Bullet Points</p>
                <p>1. Numbered List</p>
                <p>[Link Text](URL)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}