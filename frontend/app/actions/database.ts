"use server";
import { createClient } from "@/providers/supabase/server";
import { Note, Recording, Session, User } from "@/types/database";

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
    .eq("user_id", userId)
    .order("date", { ascending: false }); // Order by latest date

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
    .eq("user_id", userId)
    .order("created_at", { ascending: true }); // Order by last created

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