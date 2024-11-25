
// import { createBrowserClient } from "@supabase/ssr";

import { FileBody } from "../../types";
import { createClient } from "./server";

export const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET!;

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
