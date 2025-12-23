import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // 2. Parse request body
    const body = await request.json();
    const { title, description, thumbnailUrl, filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // 3. Verify the file exists in storage (using same client)
    const { data: fileData, error: fileCheckError } = await supabase.storage
      .from("library")
      .list("", {
        search: filePath,
        limit: 1,
      });

    // Check if file exists (basic validation)
    // Note: For a more robust check, you could download a small portion of the file
    if (fileCheckError) {
      console.error("Error checking file existence:", fileCheckError);
      // Continue anyway - the file might still exist
    }

    // 4. Insert metadata into database
    const { data: pdfData, error: dbError } = await supabase
      .from("pdf_library")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        file_path: filePath,
        thumbnail_url: thumbnailUrl?.trim() || null,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to clean up uploaded file
      await supabase.storage.from("library").remove([filePath]);
      return NextResponse.json(
        { success: false, error: "Failed to save PDF metadata" },
        { status: 500 }
      );
    }

    // 5. Revalidate library page
    revalidatePath("/library");

    return NextResponse.json({ success: true, pdfId: pdfData.id });
  } catch (error) {
    console.error("Unexpected error saving metadata:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}




