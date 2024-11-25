import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

interface NoteGeneratorProps {
  onGenerateNote: (instruction: string) => Promise<void>;
}

const presetInstructions = [
  { value: 'translate-es', label: 'Translate to Spanish' },
  { value: 'translate-fr', label: 'Translate to French' },
  { value: 'simplify', label: 'Simplify for Beginners' },
  { value: 'blog', label: 'Format as Blog Post' },
  { value: 'expert', label: 'Add Expert Context' },
  { value: 'summarize', label: 'Summarize Key Points' },
  { value: 'academic', label: 'Academic Format' },
  { value: 'bullets', label: 'Convert to Bullet Points' },
  { value: 'questions', label: 'Generate Study Questions' }
];

export function NoteGenerator({ onGenerateNote }: NoteGeneratorProps) {
  const [customInstruction, setCustomInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateNote = async () => {
    setIsLoading(true);
    await onGenerateNote(customInstruction);
    setCustomInstruction('');
    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generate New Note</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Preset Instructions</Label>
            <Select onValueChange={(value) => setCustomInstruction(presetInstructions.find(i => i.value === value)?.label || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select instruction" />
              </SelectTrigger>
              <SelectContent>
                {presetInstructions.map((instruction) => (
                  <SelectItem key={instruction.value} value={instruction.value}>
                    {instruction.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Instruction</Label>
            <Textarea
              placeholder="Enter custom instruction (e.g., 'Explain as if teaching to high school students')"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
            />
          </div>

          <Button 
            className="w-full" 
            variant="outline"
            disabled={!customInstruction || isLoading}
            onClick={handleGenerateNote}
          >
            {isLoading ? 'Generating...' : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Note
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}