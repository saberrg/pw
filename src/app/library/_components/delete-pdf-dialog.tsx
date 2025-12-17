"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePdf } from "../actions";
import { Button } from "@/app/_components/ui/button";
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
import { AlertTriangle } from "lucide-react";

interface DeletePdfDialogProps {
  pdf: PdfWithProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePdfDialog({
  pdf,
  open,
  onOpenChange,
}: DeletePdfDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePdf(pdf.id);

      if (result.success) {
        toast.success("PDF deleted successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>Delete PDF</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* PDF Preview */}
          <div className="flex items-start gap-4 rounded-lg border p-4">
            <div className="relative aspect-[3/4] w-16 bg-muted rounded overflow-hidden flex-shrink-0">
              {pdf.thumbnail_url ? (
                <img
                  src={pdf.thumbnail_url}
                  alt={pdf.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800">
                  <svg
                    className="h-6 w-6 text-blue-500 dark:text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2">{pdf.title}</h4>
              {pdf.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {pdf.description}
                </p>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-sm text-muted-foreground">
            <p>
              Are you sure you want to delete <strong>{pdf.title}</strong>?
            </p>
            <p className="mt-2">
              This will permanently remove the PDF file and all associated
              reading progress. This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
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
                Deleting...
              </>
            ) : (
              "Delete PDF"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
