"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Volume2 } from 'lucide-react';

export default function RecordingSettings() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Audio Source</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select audio source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Microphone</SelectItem>
                <SelectItem value="system">System Audio</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Session Name</Label>
            <Input placeholder="Enter session name" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Input Volume</span>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </Label>
            <div className="h-2 bg-secondary rounded-full">
              <div className="h-full w-3/4 bg-primary rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}