"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import { Save, X, Loader2 } from "lucide-react";

interface NoteFormProps {
  initialContent?: string;
  onSubmit: (content: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isEditing?: boolean;
}

const MAX_CHARS = 5000;

export function NoteForm({
  initialContent = "",
  onSubmit,
  onCancel,
  isEditing = false,
}: NoteFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEmpty || isOverLimit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(content);
      if (!result.success) {
        setError(result.error || "Failed to save note");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here... Markdown is supported!"
          className="min-h-[120px] resize-none text-sm"
          disabled={isSubmitting}
          autoFocus
        />
        <div
          className={`absolute bottom-2 right-2 text-xs ${
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isEmpty || isOverLimit || isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Note" : "Save Note"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: You can use **bold**, *italic*, and other Markdown formatting.
      </p>
    </form>
  );
}




