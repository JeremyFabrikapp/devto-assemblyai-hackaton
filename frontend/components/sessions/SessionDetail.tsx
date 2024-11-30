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
import { Note, Session } from "@/types/database";
import {
  generateDownloadLink,
  getMediaFromSession,
  getStorageFileAsAdmin,
} from "@/providers/supabase/cloudStorage";
import { createNote, getRecordingById, getSessionNotes } from "@/app/actions/database";
// import { transcribeAudio } from '@/provider/assemblyai/api';

interface SessionDetailProps {
  session: Session;
}


export default function SessionDetail({ session }: SessionDetailProps) {
  const [generatedNotes, setGeneratedNotes] = useState<Note[]>([]);

  const loadSessionNotes = async () => {
    try {
      const notes = await getSessionNotes(session.id);
      setGeneratedNotes(notes);
      console.log("Loaded session notes:", notes);
    } catch (error) {
      console.error("Error loading session notes:", error);
    }
  };

  useEffect(() => {
    loadSessionNotes();
  }, [session.id]);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const recording = await getRecordingById(session.recording_id);
        console.log("Fetched audio file:", recording?.transcript?.text);
        setTranscript(recording?.transcript);
        // setTranscript(recording?.transcript.text);
      } catch (error) {
        console.error("Error fetching recording:", error);
      }
    };

    fetchRecording();
  }, [session.id]);
  const [transcript, setTranscript] = useState<any>({});
 

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

  // useEffect(() => {
  //   const fetchTranscript = async () => {
  //     setIsTranscribing(true);
  //     setTranscriptionError(null);
  //     try {
  //       const result = await transcribe(session.audioFile);
  //       console.log("Transcription result:", result);
  //       // await handleAskQuestion(result.id);
  //       if (result && result.words) {
  //         const formattedTranscript = result.words.map((word, index) => ({
  //           id: index,
  //           speaker: word.speaker || "Unknown",
  //           text: word.text,
  //           timestamp: `${word.start}`,
  //         }));
  //         setTranscript(formattedTranscript);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching transcript:", error);
  //       setTranscriptionError("Failed to transcribe audio. Please try again.");
  //     } finally {
  //       setIsTranscribing(false);
  //     }
  //   };

  //   fetchTranscript();
  // }, [session.audioFile]);

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
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloadLink = async () => {
      try {
        const media = await getMediaFromSession(session.id);
        const link = await generateDownloadLink(media);
        setDownloadLink(link);
        console.log(`Download link for audio file: ${link}`);
      } catch (error) {
        console.error("Error generating download link:", error);
      }
    };

    fetchDownloadLink();
  }, [session.id]);

  const generateNote = async (
    transcriptId: string,
    sessionId: string,
    instruction: string
  ) => {
    try {
      // const transcriptId = "b641e780-3df8-4fd0-a18c-0da9c687c595"; // Replace with actual transcript ID
      const response = await lemurTask(
        transcriptId,
        instruction +
          `You must only return the output for the instruction, formatted as mdx. DO NOT ADD ANYTHING TO YOUR RESPONSE. The output will be used as is. DO NOT ADD MDX quotes, just the content inside.`
      );
      const newNote: Partial<Note> = {
        generation_instruction: instruction,
        content: response.response,

        title: "",
        summary: null,
        session_id: sessionId,
        tags: [],
        is_starred: false,

        is_generated: true,
      };
      const savedNote = await createNote(newNote);
      console.log("Note saved successfully:", savedNote);
      setGeneratedNotes([...generatedNotes, savedNote]);
    } catch (error) {
      console.error("Error generating note:", error);
      // Handle error appropriately, e.g., show a notification to the user
    }
  };

  const handleGenerateNote = async (instruction: string) => {
    generateNote(transcript.id, session.id, instruction).catch((error) => {
      console.error("Error generating note:", error);
      // Handle error appropriately, e.g., show a notification to the user
    });
  };

  return (
    <div className="container mx-auto py-8">
      <SessionHeader id={session.id} />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {downloadLink && <AudioPlayer audioFile={downloadLink} />}
          <TranscriptAndNotes
            transcript={transcript?.text}
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
