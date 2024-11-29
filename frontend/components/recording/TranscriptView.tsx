"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TranscriptViewProps } from "@/lib/types";


export default function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Live Transcript</h2>
        <ScrollArea className="h-[400px] pr-4">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            {transcript}
          </div>
          {/* {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Transcript will appear here when recording starts...
            </div>
          ) : (
            transcript.map((segment, index) => (
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
            ))
          )} */}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
