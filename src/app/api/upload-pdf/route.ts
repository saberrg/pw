import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

/**
 * DEPRECATED: This route has issues with large files due to Next.js body size limits.
 * Use the signed URL flow instead:
 * 1. POST /api/upload-pdf/get-signed-url - Get signed upload URL
 * 2. PUT directly to Supabase Storage - Upload file
 * 3. POST /api/upload-pdf/save-metadata - Save metadata
 * 
 * This route is kept for backwards compatibility with small files only.
 */

// Route segment config for large file uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    // 1. Create supabase client and check authentication
    // Use a single client instance to ensure consistent auth context
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to upload PDFs" },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnailUrl = formData.get("thumbnail_url") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
        { status: 400 }
      );
    }

    // 5. Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const fileName = `${timestamp}-${sanitizedName}`;

    // 6. Upload file to Supabase Storage (using same client)
    const { error: uploadError } = await supabase.storage
      .from("library")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { success: false, error: "Failed to save PDF metadata" },
        { status: 500 }
      );
    }

    // 8. Revalidate library page
    revalidatePath("/library");

    return NextResponse.json({ success: true, pdfId: pdfData.id });
  } catch (error) {
    // Log detailed error for debugging
    console.error("Unexpected error during upload:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Check for common issues
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      if (error.message.includes("body exceeded") || error.message.includes("Body is too large")) {
        errorMessage = "File too large. Please use the direct upload method for files over 4MB.";
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}




