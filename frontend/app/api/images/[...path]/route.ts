import { getStorageFileAsAdmin } from "@/providers/supabase/cloudStorage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const imagePath = Array.isArray(resolvedParams.path)
    ? resolvedParams.path.join("/")
    : resolvedParams.path;
  console.log({ imagePath: imagePath });
  const mediaExtension = imagePath.split(".").pop() as string;
  let fileExtension = "image/jpeg";
  if (mediaExtension === "mp3") {
    fileExtension = "audio/mpeg"
  }
  try {
    const imageData = await getStorageFileAsAdmin(imagePath);

    return new Response(imageData, {
      status: 200,
      headers: {
        "Content-Disposition": "inline", // Ensure the file is displayed inline
        "Content-Type": mediaExtension, // Adjust content type as needed
        "Content-Transfer-Encoding": "binary", // Adjust content type as needed
        "Content-length": imageData.byteLength.toString(), // Adjust content type as needed
        "Cache-Control": "no-cache"
      },
    });
  } catch (error) {
    console.error("Error retrieving image:", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve image" }), {
      status: 500,
    });
  }
}
