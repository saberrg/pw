"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createClient } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export type UploadResult =
  | { success: true; pdfId: string }
  | { success: false; error: string };

function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep extension
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

export async function uploadPdf(formData: FormData): Promise<UploadResult> {
  try {
    // 1. Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to upload PDFs" };
    }

    // 2. Extract and validate form data
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnailUrl = formData.get("thumbnail_url") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title is required" };
    }

    // 3. Validate file type
    if (file.type !== "application/pdf") {
      return { success: false, error: "Only PDF files are allowed" };
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      };
    }

    // 5. Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${timestamp}-${sanitizedName}`;

    // 6. Upload file to Supabase Storage
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from("library")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: "Failed to upload file to storage" };
    }

    // 7. Insert metadata into database
    const { data: pdfData, error: dbError } = await supabase
      .from("pdf_library")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        file_path: fileName,
        thumbnail_url: thumbnailUrl?.trim() || null,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to clean up uploaded file
      await supabase.storage.from("library").remove([fileName]);
      return { success: false, error: "Failed to save PDF metadata" };
    }

    // 8. Revalidate library page
    revalidatePath("/library");

    return { success: true, pdfId: pdfData.id };
  } catch (error) {
    console.error("Unexpected error during upload:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
