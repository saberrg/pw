"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { PdfWithProgress } from "../page";
import { EditPdfDialog } from "./edit-pdf-dialog";
import { DeletePdfDialog } from "./delete-pdf-dialog";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface PdfCardProps {
  pdf: PdfWithProgress;
}

export function PdfCard({ pdf }: PdfCardProps) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const hasProgress = pdf.current_page && pdf.current_page > 1;
  const progressPercentage =
    pdf.current_page && pdf.total_pages
      ? Math.round((pdf.current_page / pdf.total_pages) * 100)
      : 0;

  const handleCardClick = () => {
    router.push(`/library/${pdf.id}`);
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow group relative">
        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/95"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDialog(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clickable Card Content */}
        <div
          onClick={handleCardClick}
          className="cursor-pointer h-full flex flex-col"
        >
          <CardHeader className="p-0">
            <div className="relative aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
              {pdf.thumbnail_url ? (
                <img
                  src={pdf.thumbnail_url}
                  alt={pdf.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800">
                  <svg
                    className="h-16 w-16 text-blue-500 dark:text-blue-300"
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
              {hasProgress && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-base line-clamp-2 mb-1">
              {pdf.title}
            </CardTitle>
            {pdf.description && (
              <CardDescription className="line-clamp-2 text-sm">
                {pdf.description}
              </CardDescription>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            {hasProgress ? (
              <Badge variant="secondary" className="text-xs">
                Page {pdf.current_page} of {pdf.total_pages}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Not started
              </Badge>
            )}
          </CardFooter>
        </div>
      </Card>

      {/* Dialogs */}
      <EditPdfDialog
        pdf={pdf}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeletePdfDialog
        pdf={pdf}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
