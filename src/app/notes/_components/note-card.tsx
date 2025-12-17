"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Textarea } from "@/app/_components/ui/textarea";
import { updateNote, deleteNote } from "@/app/notes/actions";
import type { NoteWithPdfAndAuthor } from "@/interfaces/note";
import {
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface NoteCardProps {
  note: NoteWithPdfAndAuthor;
  isOwner: boolean;
  isAuthenticated: boolean;
  onDelete?: (noteId: string) => void;
  onUpdate?: (noteId: string, content: string) => void;
}

export function NoteCard({ note, isOwner, isAuthenticated, onDelete, onUpdate }: NoteCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEdit = async () => {
    if (editContent.trim().length === 0) return;
    
    setIsSubmitting(true);
    setError(null);

    const result = await updateNote(note.id, editContent);
    
    if (result.success) {
      onUpdate?.(note.id, editContent);
      setIsEditDialogOpen(false);
    } else {
      setError(result.error);
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await deleteNote(note.id);
    
    if (result.success) {
      onDelete?.(note.id);
      setIsDeleteDialogOpen(false);
    } else {
      setError(result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            {isAuthenticated ? (
              <Link
                href={`/library/${note.pdf_id}?page=${note.page_number}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline group/link"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="line-clamp-1">{note.pdf_title}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="line-clamp-1">{note.pdf_title}</span>
              </div>
            )}
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <Badge variant="secondary" className="w-fit text-xs">
            Page {note.page_number}
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-6">
            <ReactMarkdown>{note.content}</ReactMarkdown>
          </div>
        </CardContent>

        <CardFooter className="pt-0 text-xs text-muted-foreground">
          <span>{formatDate(note.created_at)}</span>
          {note.updated_at !== note.created_at && (
            <span className="ml-2">(edited)</span>
          )}
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update your note for {note.pdf_title}, Page {note.page_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[150px] resize-none"
              disabled={isSubmitting}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isSubmitting || editContent.trim().length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
