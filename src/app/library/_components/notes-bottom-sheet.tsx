"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Button } from "@/app/_components/ui/button";
import { NoteForm } from "./note-form";
import { createNote, updateNote, deleteNote } from "@/app/notes/actions";
import type { Note } from "@/interfaces/note";
import { MessageSquarePlus, X, Pencil, Trash2 } from "lucide-react";

interface NotesBottomSheetProps {
  pdfId: string;
  pdfTitle: string;
  currentPage: number;
  userId: string;
}

export function NotesBottomSheet({
  pdfId,
  pdfTitle,
  currentPage,
  userId,
}: NotesBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const currentDragY = useRef<number>(0);

  // Fetch notes for current page
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAuth
        .from("pdf_notes")
        .select("*")
        .eq("pdf_id", pdfId)
        .eq("page_number", currentPage)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
      } else {
        setNotes(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pdfId, currentPage]);

  // Fetch notes when page changes or sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, currentPage, fetchNotes]);

  // Handle create note
  const handleCreateNote = async (content: string) => {
    const result = await createNote(pdfId, currentPage, content);
    if (result.success) {
      setNotes((prev) => [result.note, ...prev]);
      setShowForm(false);
    }
    return result;
  };

  // Handle update note
  const handleUpdateNote = async (content: string) => {
    if (!editingNote) return { success: false, error: "No note selected" };
    
    const result = await updateNote(editingNote.id, content);
    if (result.success) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, content, updated_at: new Date().toISOString() }
            : n
        )
      );
      setEditingNote(null);
    }
    return result;
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    const result = await deleteNote(noteId);
    if (result.success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
    setDeletingNoteId(null);
    return result;
  };

  // Touch handling for swipe-down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentDragY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = currentDragY.current - dragStartY.current;
    if (diff > 100) {
      setIsOpen(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="Open notes"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        >
          {/* Bottom Sheet */}
          <div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-h-[70vh] sm:max-h-[60vh] flex flex-col"
            style={{
              transform: isOpen ? "translateY(0)" : "translateY(100%)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b">
              <div>
                <h2 className="text-lg font-semibold">Notes for Page {currentPage}</h2>
                <p className="text-sm text-muted-foreground truncate max-w-[250px] sm:max-w-none">
                  {pdfTitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Add Note Button or Form */}
              {showForm || editingNote ? (
                <NoteForm
                  initialContent={editingNote?.content || ""}
                  onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingNote(null);
                  }}
                  isEditing={!!editingNote}
                />
              ) : (
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Add a note for this page
                </Button>
              )}

              {/* Notes List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notes for this page yet.</p>
                  <p className="text-sm">Be the first to add one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-muted/50 rounded-lg p-3 border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1">
                          {note.content}
                        </p>
                        {note.user_id === userId && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingNote(note)}
                              className="h-7 w-7 p-0"
                              disabled={!!deletingNoteId}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              disabled={deletingNoteId === note.id}
                            >
                              {deletingNoteId === note.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-destructive" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.created_at)}
                        {note.updated_at !== note.created_at && " (edited)"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
