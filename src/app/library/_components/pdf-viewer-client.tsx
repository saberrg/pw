"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDebouncedCallback } from "use-debounce";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Button } from "@/app/_components/ui/button";

// Note: TextLayer and AnnotationLayer CSS not needed since we disable these layers
// This prevents the "TextLayer task cancelled" warning

// Set up the worker - this runs only on client since this file is dynamically imported
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerClientProps {
  pdfId: string;
  pdfUrl: string;
  initialPage: number;
  userId: string;
}

export function PdfViewerClient({ pdfId, pdfUrl, initialPage, userId }: PdfViewerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Touch handling for swipe navigation
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Detect mobile and set container width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      checkMobile();
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 3-second debounced save for optimal performance
  const saveProgress = useDebouncedCallback(async (page: number, totalPages: number) => {
    try {
      const { error } = await supabaseAuth
        .from("user_pdf_progress")
        .upsert(
          {
            user_id: userId,
            pdf_id: pdfId,
            current_page: page,
            total_pages: totalPages,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: "user_id,pdf_id" }
        );

      if (error) {
        console.error("Error saving progress:", error);
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, 3000);

  // Save progress when page changes
  useEffect(() => {
    if (numPages > 0 && currentPage > 0) {
      saveProgress(currentPage, numPages);
    }
  }, [currentPage, numPages, saveProgress]);

  // Save progress before leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (numPages > 0 && currentPage > 0) {
        saveProgress.flush();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveProgress.flush();
    };
  }, [currentPage, numPages, saveProgress]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("Error loading PDF:", err);
    setError("Failed to load PDF. Please try again.");
    setIsLoading(false);
  }, []);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await viewerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next page
        goToNextPage();
      } else {
        // Swipe right - previous page
        goToPreviousPage();
      }
    }
  };

  // Calculate page width for responsive display
  const getPageWidth = () => {
    if (isMobile) {
      // On mobile, fit to container width with some padding
      return Math.max(containerWidth - 32, 300);
    }
    return undefined; // Use scale on desktop
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef}
      className={`flex flex-col h-full bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      {/* Controls bar - responsive layout */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-1 sm:gap-2">
          {/* Page navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="text-xs sm:text-sm font-medium min-w-[70px] sm:min-w-[100px] text-center">
              {isLoading ? "..." : `${currentPage} / ${numPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage >= numPages || isLoading}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Zoom controls - hidden on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5 || isLoading}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetZoom}
                  className="text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] h-8 sm:h-9"
                >
                  {Math.round(scale * 100)}%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3 || isLoading}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </>
            )}
            
            {/* Fullscreen button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              disabled={isLoading}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Document with touch support */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto py-4 sm:py-6 bg-muted/30"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center px-2 sm:px-4">
          {isLoading && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="shadow-lg rounded-lg overflow-hidden"
          >
            <Page
              pageNumber={currentPage}
              scale={isMobile ? undefined : scale}
              width={getPageWidth()}
              className="bg-white"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="h-1 bg-muted shrink-0">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${numPages > 0 ? (currentPage / numPages) * 100 : 0}%` }}
        />
      </div>

      {/* Mobile swipe hint - shows on mobile */}
      {isMobile && !isLoading && numPages > 1 && (
        <div className="text-center py-2 text-xs text-muted-foreground bg-muted/50">
          Swipe left/right to navigate pages
        </div>
      )}
    </div>
  );
}
