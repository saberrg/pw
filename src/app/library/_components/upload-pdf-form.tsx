"use client";

import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { toast } from "sonner";

interface UploadPdfFormProps {
  onSuccess?: (pdfId: string) => void;
  onCancel?: () => void;
}

export function UploadPdfForm({ onSuccess, onCancel }: UploadPdfFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): boolean => {
    setFileError(null);

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      // Auto-fill title from filename if title is empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.pdf$/i, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get signed upload URL from our API
      setUploadProgress(5);
      const signedUrlResponse = await fetch("/api/upload-pdf/get-signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          contentType: selectedFile.type,
        }),
      });

      const signedUrlResult = await signedUrlResponse.json();

      if (!signedUrlResult.success) {
        toast.error(signedUrlResult.error || "Failed to get upload URL");
        return;
      }

      // Step 2: Upload directly to Supabase Storage using signed URL
      setUploadProgress(10);
      
      const uploadResponse = await uploadWithProgress(
        signedUrlResult.signedUrl,
        selectedFile,
        (progress) => {
          // Map progress from 10% to 80%
          setUploadProgress(10 + Math.round(progress * 0.7));
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Storage upload failed:", errorText);
        toast.error("Failed to upload file to storage");
        return;
      }

      // Step 3: Save metadata to database
      setUploadProgress(85);
      const metadataResponse = await fetch("/api/upload-pdf/save-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          filePath: signedUrlResult.path,
        }),
      });

      const metadataResult = await metadataResponse.json();

      if (!metadataResult.success) {
        toast.error(metadataResult.error || "Failed to save PDF metadata");
        return;
      }

      setUploadProgress(100);
      toast.success("PDF uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setFileError(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(metadataResult.pdfId);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload file with progress tracking using XMLHttpRequest
  const uploadWithProgress = (
    url: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        // Create a Response-like object
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
        }));
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", "application/pdf");
      xhr.send(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label htmlFor="file-upload">PDF File *</Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
            ${fileError ? "border-destructive" : ""}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 50MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="h-12 w-12 text-blue-500"
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
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setFileError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        {fileError && (
          <p className="text-sm text-destructive">{fileError}</p>
        )}
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter PDF title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isUploading}
        />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter a brief description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isUploading}
        />
      </div>

      {/* Thumbnail URL Input */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail-url">Thumbnail URL (optional)</Label>
        <Input
          id="thumbnail-url"
          type="url"
          placeholder="https://example.com/thumbnail.jpg"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">
          Enter a URL for the PDF cover image
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isUploading || !selectedFile}>
          {isUploading ? (
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
              Uploading...
            </>
          ) : (
            "Upload PDF"
          )}
        </Button>
      </div>
    </form>
  );
}
