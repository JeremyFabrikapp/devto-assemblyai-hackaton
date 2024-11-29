import { TranscriptSegment } from "@/lib/types";
import { Transcript } from "assemblyai";

// Interfaces
export interface User {
    id: string;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Recording {
    id: string;
    title: string | null;
    start_time: string | null;
    duration: number | null;
    transcript: Transcript; // JSONB in PostgreSQL
    status: string | null;
    audio_file: string | null;
    summary: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    title: string;
    date: string;
    status: string;
    summary: string | null;
    recording_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    created_at: string;
    updated_at: string;
    tags: string[];
    is_starred: boolean;
    session_id: string;
    user_id: string;
    is_generated: boolean;
    generation_instruction: string | null;
}



export interface TranscriptAndNotesProps {
    words?: TranscriptSegment[];
    transcript: string;
    generatedNotes: Note[];
}
