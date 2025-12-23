"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createClient } from "@/lib/supabase-server";
import type { Note, NoteWithPdfAndAuthor } from "@/interfaces/note";

export type CreateNoteResult =
  | { success: true; note: Note }
  | { success: false; error: string };

export type UpdateNoteResult =
  | { success: true }
  | { success: false; error: string };

export type DeleteNoteResult =
  | { success: true }
  | { success: false; error: string };

export async function createNote(
  pdfId: string,
  pageNumber: number,
  content: string
): Promise<CreateNoteResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to create notes" };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Note content is required" };
    }

    if (content.trim().length > 5000) {
      return { success: false, error: "Note content must be less than 5000 characters" };
    }

    if (pageNumber < 1) {
      return { success: false, error: "Invalid page number" };
    }

    const supabase = await createClient();

    const { data: noteData, error: dbError } = await supabase
      .from("pdf_notes")
      .insert({
        pdf_id: pdfId,
        user_id: user.id,
        page_number: pageNumber,
        content: content.trim(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      return { success: false, error: "Failed to save note" };
    }

    revalidatePath(`/library/${pdfId}`);
    revalidatePath("/notes");

    return { success: true, note: noteData };
  } catch (error) {
    console.error("Unexpected error creating note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateNote(
  noteId: string,
  content: string
): Promise<UpdateNoteResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to update notes" };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Note content is required" };
    }

    if (content.trim().length > 5000) {
      return { success: false, error: "Note content must be less than 5000 characters" };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existingNote, error: fetchError } = await supabase
      .from("pdf_notes")
      .select("user_id, pdf_id")
      .eq("id", noteId)
      .single();

    if (fetchError || !existingNote) {
      return { success: false, error: "Note not found" };
    }

    if (existingNote.user_id !== user.id) {
      return { success: false, error: "You can only edit your own notes" };
    }

    const { error: updateError } = await supabase
      .from("pdf_notes")
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return { success: false, error: "Failed to update note" };
    }

    revalidatePath(`/library/${existingNote.pdf_id}`);
    revalidatePath("/notes");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteNote(noteId: string): Promise<DeleteNoteResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: "You must be signed in to delete notes" };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: existingNote, error: fetchError } = await supabase
      .from("pdf_notes")
      .select("user_id, pdf_id")
      .eq("id", noteId)
      .single();

    if (fetchError || !existingNote) {
      return { success: false, error: "Note not found" };
    }

    if (existingNote.user_id !== user.id) {
      return { success: false, error: "You can only delete your own notes" };
    }

    const { error: deleteError } = await supabase
      .from("pdf_notes")
      .delete()
      .eq("id", noteId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return { success: false, error: "Failed to delete note" };
    }

    revalidatePath(`/library/${existingNote.pdf_id}`);
    revalidatePath("/notes");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting note:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getNotesForPage(
  pdfId: string,
  pageNumber: number
): Promise<Note[]> {
  try {
    const supabase = await createClient();

    const { data: notes, error } = await supabase
      .from("pdf_notes")
      .select("*")
      .eq("pdf_id", pdfId)
      .eq("page_number", pageNumber)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
      return [];
    }

    return notes || [];
  } catch (error) {
    console.error("Unexpected error fetching notes:", error);
    return [];
  }
}

export async function getAllNotes(
  pdfFilter?: string,
  searchQuery?: string
): Promise<NoteWithPdfAndAuthor[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("pdf_notes")
      .select(`
        *,
        pdf_library!inner (
          title,
          description
        )
      `)
      .order("created_at", { ascending: false });

    if (pdfFilter) {
      query = query.eq("pdf_id", pdfFilter);
    }

    if (searchQuery) {
      query = query.ilike("content", `%${searchQuery}%`);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Error fetching all notes:", error);
      return [];
    }

    // Transform the data to match our interface
    const transformedNotes: NoteWithPdfAndAuthor[] = (notes || []).map((note: any) => ({
      id: note.id,
      pdf_id: note.pdf_id,
      user_id: note.user_id,
      page_number: note.page_number,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      pdf_title: note.pdf_library.title,
      pdf_description: note.pdf_library.description,
    }));

    return transformedNotes;
  } catch (error) {
    console.error("Unexpected error fetching all notes:", error);
    return [];
  }
}

export async function getPdfsWithNotes(): Promise<{ id: string; title: string }[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pdf_notes")
      .select(`
        pdf_id,
        pdf_library!inner (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching PDFs with notes:", error);
      return [];
    }

    // Deduplicate by pdf_id
    const uniquePdfs = new Map<string, { id: string; title: string }>();
    for (const item of data || []) {
      if (!uniquePdfs.has(item.pdf_id)) {
        uniquePdfs.set(item.pdf_id, {
          id: (item.pdf_library as any).id,
          title: (item.pdf_library as any).title,
        });
      }
    }

    return Array.from(uniquePdfs.values());
  } catch (error) {
    console.error("Unexpected error fetching PDFs with notes:", error);
    return [];
  }
}




