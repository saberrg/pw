"use client";

import { useState, FormEvent } from "react";
import { updatePdf } from "../actions";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { toast } from "sonner";
import { PdfWithProgress } from "../page";

interface EditPdfDialogProps {
  pdf: PdfWithProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPdfDialog({ pdf, open, onOpenChange }: EditPdfDialogProps) {
  const [title, setTitle] = useState(pdf.title);
  const [description, setDescription] = useState(pdf.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(pdf.thumbnail_url || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("thumbnail_url", thumbnailUrl.trim());

      const result = await updatePdf(pdf.id, formData);

      if (result.success) {
        toast.success("PDF updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit PDF</DialogTitle>
          <DialogDescription>
            Update the metadata for your PDF document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thumbnail Preview */}
          {thumbnailUrl && (
            <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder="Enter PDF title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUpdating}
              maxLength={200}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter a brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isUpdating}
              maxLength={1000}
            />
          </div>

          {/* Thumbnail URL Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail-url">Thumbnail URL</Label>
            <Input
              id="edit-thumbnail-url"
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL for the PDF cover image
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
