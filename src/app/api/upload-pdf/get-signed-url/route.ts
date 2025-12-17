import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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

    // 2. Parse request body (small JSON, not file data)
    const body = await request.json();
    const { fileName, fileSize, contentType } = body;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "File name is required" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (contentType !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (fileSize > MAX_FILE_SIZE) {
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
    const sanitizedName = sanitizeFileName(fileName);
    const storagePath = `${timestamp}-${sanitizedName}`;

    // 6. Create signed upload URL (using same client)
    const { data, error } = await supabase.storage
      .from("library")
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create upload URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
    });
  } catch (error) {
    console.error("Unexpected error getting signed URL:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
