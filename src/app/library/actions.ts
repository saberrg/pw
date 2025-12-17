"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createClient } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export type UploadResult =
  | { success: true; pdfId: string }
  | { success: false; error: string };

export type UpdateResult =
  | { success: true }
  | { success: false; error: string };

export type DeleteResult =
  | { success: true }
  | { success: false; error: string };

function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep extension
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * DEPRECATED: This server action has issues with large files due to Next.js body size limits.
 * The upload form now uses the signed URL flow via API routes instead:
 * 1. POST /api/upload-pdf/get-signed-url - Get signed upload URL
 * 2. PUT directly to Supabase Storage - Upload file
 * 3. POST /api/upload-pdf/save-metadata - Save metadata
 * 
 * This function is kept for backwards compatibility with small files only.
 */
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
        user_id: user.id,
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
    
    // Provide more helpful error message for large file issues
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      if (error.message.includes("body exceeded") || error.message.includes("Body is too large")) {
        errorMessage = "File too large for server action. Use the upload dialog which handles large files.";
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function updatePdf(
  pdfId: string,
  formData: FormData
): Promise<UpdateResult> {
  try {
    // 1. Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to update PDFs" };
    }

    // 2. Extract and validate form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnailUrl = formData.get("thumbnail_url") as string;

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title is required" };
    }

    if (title.trim().length > 200) {
      return { success: false, error: "Title must be less than 200 characters" };
    }

    if (description && description.trim().length > 1000) {
      return { success: false, error: "Description must be less than 1000 characters" };
    }

    // 3. Update PDF metadata in database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("pdf_library")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        thumbnail_url: thumbnailUrl?.trim() || null,
      })
      .eq("id", pdfId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return { success: false, error: "Failed to update PDF metadata" };
    }

    // 4. Revalidate library page
    revalidatePath("/library");
    revalidatePath(`/library/${pdfId}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during update:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deletePdf(pdfId: string): Promise<DeleteResult> {
  try {
    // 1. Check authentication
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to delete PDFs" };
    }

    const supabase = await createClient();

    // 2. Get PDF details to retrieve file_path
    const { data: pdfData, error: fetchError } = await supabase
      .from("pdf_library")
      .select("file_path")
      .eq("id", pdfId)
      .single();

    if (fetchError || !pdfData) {
      console.error("Error fetching PDF:", fetchError);
      return { success: false, error: "PDF not found" };
    }

    // 3. Delete from database first (this will cascade to user_pdf_progress if set up)
    const { error: deleteError } = await supabase
      .from("pdf_library")
      .delete()
      .eq("id", pdfId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return { success: false, error: "Failed to delete PDF" };
    }

    // 4. Delete file from storage (non-blocking if fails)
    // If this fails, we still consider the operation successful since DB is cleaned
    try {
      const { error: storageError } = await supabase.storage
        .from("library")
        .remove([pdfData.file_path]);

      if (storageError) {
        console.error("Storage delete error (non-critical):", storageError);
        // Don't fail the operation - DB record is already deleted
      }
    } catch (storageErr) {
      console.error("Storage delete exception (non-critical):", storageErr);
      // Continue - DB cleanup is what matters most
    }

    // 5. Revalidate library page
    revalidatePath("/library");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during delete:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
