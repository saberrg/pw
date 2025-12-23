"use client";

import { useState } from "react";
import { NoteCard } from "./note-card";
import type { NoteWithPdfAndAuthor } from "@/interfaces/note";
import { MessageSquare } from "lucide-react";

interface NotesListProps {
  notes: NoteWithPdfAndAuthor[];
  currentUserId?: string;
}

export function NotesList({ notes: initialNotes, currentUserId }: NotesListProps) {
  const [notes, setNotes] = useState(initialNotes);

  const handleDelete = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleUpdate = (noteId: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, content, updated_at: new Date().toISOString() }
          : n
      )
    );
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground">
          <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm mt-1">
            Notes will appear here when users add them while reading PDFs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isOwner={currentUserId === note.user_id}
          isAuthenticated={!!currentUserId}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}




