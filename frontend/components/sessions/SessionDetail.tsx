"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/lib/stores/sessions.store";
import { SessionHeader } from "./SessionHeader";
import { AudioPlayer } from "./AudioPlayer";
import { TranscriptAndNotes } from "./TranscriptAndNotes";
import { SessionInfo } from "./SessionInfo";
import { NoteGenerator } from "./NoteGenerator";
import { QuickActions } from "./QuickActions";
import { useAssembly } from "@/hooks/use-assembly";
import {
  lemurTask,
  questionAnswer,
  transcribe,
} from "@/app/actions/transcribe";
// import { transcribeAudio } from '@/provider/assemblyai/api';

interface SessionDetailProps {
  id: string;
}

interface GeneratedNote {
  id: number;
  instruction: string;
  content: string;
  timestamp: string;
}

// Mock session data
const mockSession = {
  id: "1",
  title: "Mock Session",
  // audioFile: 'http://localhost:3000/audio/sports_injuries.mp3',
  audioFile:
    "https://storage.googleapis.com/aai-docs-samples/sports_injuries.mp3",
  transcript: [
    {
      id: 1,
      speaker: "Speaker 1",
      text: "This is a mock transcript.",
      timestamp: "00:00:00",
    },
    {
      id: 2,
      speaker: "Speaker 2",
      text: "It simulates a real session.",
      timestamp: "00:00:05",
    },
  ],
};

export default function SessionDetail({ id }: SessionDetailProps) {
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [transcript, setTranscript] = useState(mockSession.transcript);
  const session =
    useSessionStore((state) => state.sessions.find((s) => s.id === id)) ||
    mockSession;

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );

  const [question, setQuestion] = useState<string>("What is the sumamry ?");
  const [answer, setAnswer] = useState<string | null>(null);

  const handleAskQuestion = async (transcriptId: string) => {
    if (!question) return;

    try {
      const response = await questionAnswer(transcriptId, [{ question }]);
      console.log("Question answer response:", response);
      if (response && response.response) {
        setAnswer(response.response[0].answer);
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("Failed to get an answer. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTranscript = async () => {
      setIsTranscribing(true);
      setTranscriptionError(null);
      try {
        const result = await transcribe(session.audioFile);
        console.log("Transcription result:", result);
        // await handleAskQuestion(result.id);
        if (result && result.words) {
          const formattedTranscript = result.words.map((word, index) => ({
            id: index,
            speaker: word.speaker || "Unknown",
            text: word.text,
            timestamp: `${word.start}`,
          }));
          setTranscript(formattedTranscript);
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
        setTranscriptionError("Failed to transcribe audio. Please try again.");
      } finally {
        setIsTranscribing(false);
      }
    };

    fetchTranscript();
  }, [session.audioFile]);

  // const { transcribeAudio, isLoading, error } = useAssembly();

  // useEffect(() => {
  //   // const fetchTranscript = async () => {
  //   //   try {
  //   //     const result = await transcribeAudio(session.audioFile);
  //   //     if (result && result.words) {
  //   //       const formattedTranscript = result.words.map((word, index) => ({
  //   //         id: index,
  //   //         speaker: word.speaker || 'Unknown',
  //   //         text: word.text,
  //   //         timestamp: `${word.start}`
  //   //       }));
  //   //       setTranscript(formattedTranscript);
  //   //     }
  //   //   } catch (error) {
  //   //     console.error('Error fetching transcript:', error);
  //   //   }
  //   // };

  //   // fetchTranscript();
  // }, [session.audioFile, transcribeAudio]);

  // if (isLoading) {
  //   return <div>Loading transcript...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  const generateNote = async (instruction: string) => {
    try {
      const transcriptId = "b641e780-3df8-4fd0-a18c-0da9c687c595"; // Replace with actual transcript ID
      const response = await lemurTask(transcriptId, instruction + `You must only return the output for the instruction, formatted as mdx. DO NOT ADD ANYTHING TO YOUR RESPONSE. The output will be used as is. DO NOT ADD MDX quotes, just the content inside.`);
      const newNote: GeneratedNote = {
        id: Date.now(),
        instruction,
        content: response.response, // Assuming response has a content field
        timestamp: new Date().toISOString(),
      };
      setGeneratedNotes([...generatedNotes, newNote]);
    } catch (error) {
      console.error("Error generating note:", error);
      // Handle error appropriately, e.g., show a notification to the user
    }
  };
  const handleGenerateNote = async (instruction: string) => {
    await generateNote(instruction);
  };

  return (
    <div className="container mx-auto py-8">
      <SessionHeader id={id} />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <AudioPlayer audioFile={session.audioFile} />
          <TranscriptAndNotes
            transcript={transcript}
            generatedNotes={generatedNotes}
          />
        </div>

        <div className="space-y-8">
          <SessionInfo />
          <NoteGenerator onGenerateNote={handleGenerateNote} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
