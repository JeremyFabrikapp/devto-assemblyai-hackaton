"use server";

import { createClient } from "./server";

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
  title: string;
  start_time: string;
  duration: number;
  transcript: any; // JSONB in PostgreSQL
  status: string;
  audio_file: string;
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

// User functions
export async function createUser(userData: Partial<User>): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }

  return data;
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user sessions:", error);
    throw new Error("Failed to fetch user sessions");
  }

  return data;
}

// Recording functions
export async function createRecording(recordingData: Partial<Recording>): Promise<Recording> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .insert(recordingData)
    .select()
    .single();

  if (error) {
    console.error("Error creating recording:", error);
    throw new Error("Failed to create recording");
  }

  return data;
}

export async function getRecordingById(recordingId: string): Promise<Recording | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .select()
    .eq("id", recordingId)
    .single();

  if (error) {
    console.error("Error fetching recording:", error);
    return null;
  }

  return data;
}

export async function getUserRecordings(userId: string): Promise<Recording[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .select()
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user recordings:", error);
    throw new Error("Failed to fetch user recordings");
  }

  return data;
}

export async function updateRecording(id: string, data: Partial<Recording>) {
  const supabase = createClient();
  const { data: updatedRecording, error } = await supabase
    .from('recordings')
    .update(data)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error updating recording:', error);
    throw error;
  }

  return updatedRecording;
}
// Session functions
export async function createSession(sessionData: Partial<Session>): Promise<Session> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }

  return data;
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data;
}

// Note functions
export async function createNote(noteData: Partial<Note>): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .insert(noteData)
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw new Error("Failed to create note");
  }

  return data;
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .select()
    .eq("id", noteId)
    .single();

  if (error) {
    console.error("Error fetching note:", error);
    return null;
  }

  return data;
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }

  return data;
}


export async function updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("Error updating note:", error);
    throw new Error("Failed to update note");
  }

  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .select()
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user notes:", error);
    throw new Error("Failed to fetch user notes");
  }

  return data;
}

export async function getSessionNotes(sessionId: string): Promise<Note[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .select()
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error fetching session notes:", error);
    throw new Error("Failed to fetch session notes");
  }

  return data;
}