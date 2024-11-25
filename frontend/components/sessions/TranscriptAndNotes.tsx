import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';

interface TranscriptSegment {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
}

interface GeneratedNote {
  id: number;
  instruction: string;
  content: string;
  timestamp: string;
}

interface TranscriptAndNotesProps {
  transcript: TranscriptSegment[];
  generatedNotes: GeneratedNote[];
}

export function TranscriptAndNotes({ transcript, generatedNotes }: TranscriptAndNotesProps) {
  const [activeTab, setActiveTab] = useState('transcript');

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="transcript">
                <FileText className="h-4 w-4 mr-2" />
                Transcript
              </TabsTrigger>
              {generatedNotes.map((note) => (
                <TabsTrigger key={note.id} value={`note-${note.id}`}>
                  {note.instruction}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="transcript">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {transcript.map((segment, index) => (
                  <span key={segment.id}>
                    {/* <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{segment.speaker}</span>
                        <span className="text-sm text-muted-foreground">
                          {segment.timestamp}
                        </span>
                      </div>
                    </div> */}
                    {" "}
                    {segment.text}
                    {/* <p className="mt-1">{segment.text}</p>
                    {index < transcript.length - 1 && (
                      <Separator className="my-4" />
                    )} */}
                  </span>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {generatedNotes.map((note) => (
            <TabsContent key={note.id} value={`note-${note.id}`}>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{note.instruction}</h3>
                    <span className="text-sm text-muted-foreground">
                      Generated at {note.timestamp}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
                    {note.content}
                  </pre>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}