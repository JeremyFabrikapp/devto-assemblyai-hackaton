
// import { createBrowserClient } from "@supabase/ssr";
"use server";
import { FileBody } from "@/types/file";
import { createClient } from "./server";



const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET!;

export async function uploadFile(filePath: string, fileBody: FileBody) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(filePath, fileBody);

  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }

  return data;
}

export async function getFileUrl(filePath: string) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getStorageFileAsAdmin(filePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .download(filePath);

  if (error) {
    console.error('Error retrieving image:', error);
    throw error;
  }

  const blob = await data.arrayBuffer();
  return blob;
}

export async function getMediaFromSession(sessionId: string) {
  const supabase = createClient();
  
  // First, fetch the recording_id associated with the sessionId
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions') // Assuming there is a 'sessions' table
    .select('recording_id') // Fetching the recording_id
    .eq('id', sessionId) // Match the session by its ID
    .single();

  if (sessionError) {
    console.error('Error fetching recording_id from session:', sessionError);
    throw sessionError;
  }

  // Now, use the recording_id to fetch the audio_file from recordings
  const recordingId = sessionData.recording_id;
  const { data, error } = await supabase
    .from('recordings') // Querying the recordings table
    .select('audio_file') // Assuming 'audio_file' is the column name for media
    .eq('id', recordingId) // Match the recording by its ID
    .single();

  if (error) {
    console.error('Error fetching media from recording:', error);
    throw error;
  }

  return data.audio_file; // Return the media file URL or path
}


export async function generateDownloadLink(filePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(filePath, 60 * 5); // Link valid for 5 minutes

  if (error) {
    console.error('Error generating download link:', error);
    throw error;
  }

  return data.signedUrl;
}
