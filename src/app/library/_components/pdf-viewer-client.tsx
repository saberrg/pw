"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDebouncedCallback } from "use-debounce";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Button } from "@/app/_components/ui/button";
import { NotesBottomSheet } from "./notes-bottom-sheet";
import Link from "next/link";

// Note: TextLayer and AnnotationLayer CSS not needed since we disable these layers
// This prevents the "TextLayer task cancelled" warning

// Set up the worker - this runs only on client since this file is dynamically imported
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerClientProps {
  pdfId: string;
  pdfUrl: string;
  pdfTitle: string;
  initialPage: number;
  userId: string;
}

export function PdfViewerClient({ pdfId, pdfUrl, pdfTitle, initialPage, userId }: PdfViewerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout>();
  
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showPageJumpModal, setShowPageJumpModal] = useState<boolean>(false);
  const [pageJumpInput, setPageJumpInput] = useState<string>("");
  const [tapFeedback, setTapFeedback] = useState<{ x: number; y: number; id: number; isLongPress?: boolean } | null>(null);
  const [immersiveMode, setImmersiveMode] = useState<boolean>(false);
  const [showImmersiveHint, setShowImmersiveHint] = useState<boolean>(false);

  // Touch handling for swipe navigation and long press
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const longPressTriggeredRef = useRef<boolean>(false);

  // Detect mobile and set container width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const updateWidth = () => {
      if (containerRef.current) {
        // In immersive mode, use full viewport width
        setContainerWidth(immersiveMode ? window.innerWidth : containerRef.current.clientWidth);
      } else if (immersiveMode) {
        setContainerWidth(window.innerWidth);
      }
      checkMobile();
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Auto-hide controls on mobile
  useEffect(() => {
    if (!isMobile || !controlsVisible) return;

    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);

    return () => clearTimeout(hideTimerRef.current);
  }, [controlsVisible, isMobile, currentPage]);

  // Show controls initially when page loads
  useEffect(() => {
    if (isMobile && !isLoading) {
      setControlsVisible(true);
    }
  }, [isMobile, isLoading]);

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

  const showControls = useCallback(() => {
    setControlsVisible(true);
  }, []);

  const toggleControls = useCallback(() => {
    if (immersiveMode) {
      // In immersive mode, show controls temporarily to allow exit
      setControlsVisible(true);
      // Auto-hide after 3 seconds
      setTimeout(() => {
        if (immersiveMode) {
          setControlsVisible(false);
        }
      }, 3000);
    } else {
      setControlsVisible((prev) => !prev);
    }
  }, [immersiveMode]);

  const toggleImmersiveMode = useCallback(() => {
    setImmersiveMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        // Entering immersive mode - hide controls and show hint
        setControlsVisible(false);
        setShowImmersiveHint(true);
        setTimeout(() => setShowImmersiveHint(false), 3000);
      } else {
        // Exiting immersive mode - show controls briefly
        setControlsVisible(true);
        setShowImmersiveHint(false);
      }
      return newMode;
    });
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    if (isMobile) showControls();
  }, [isMobile, showControls]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
    if (isMobile) showControls();
  }, [numPages, isMobile, showControls]);

  const jumpToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, numPages));
    setCurrentPage(targetPage);
    setShowPageJumpModal(false);
    setPageJumpInput("");
  }, [numPages]);

  const handlePageJumpSubmit = useCallback(() => {
    const page = parseInt(pageJumpInput, 10);
    if (!isNaN(page)) {
      jumpToPage(page);
    }
  }, [pageJumpInput, jumpToPage]);

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

  // Touch handlers for swipe navigation, tap zones, and long press
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    longPressTriggeredRef.current = false;

    // Start long press timer (500ms)
    if (isMobile) {
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        toggleImmersiveMode();
        // Show visual feedback with larger animation
        setTapFeedback({ 
          x: touchStartX.current, 
          y: touchStartY.current, 
          id: Date.now() 
        });
        setTimeout(() => setTapFeedback(null), 800);
      }, 500);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    // Cancel long press if user moves finger too much
    const moveThreshold = 10;
    const moveX = Math.abs(touchEndX.current - touchStartX.current);
    const moveY = Math.abs(touchEndY.current - touchStartY.current);
    
    if (moveX > moveThreshold || moveY > moveThreshold) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // If long press was triggered, don't process tap/swipe
    if (longPressTriggeredRef.current) {
      return;
    }

    const swipeThreshold = 50;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = Math.abs(touchStartY.current - touchEndY.current);

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        // Swipe left - next page
        goToNextPage();
      } else {
        // Swipe right - previous page
        goToPreviousPage();
      }
    }
  };

  // Tap zone handler for mobile
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMobile || isLoading) return;

    // Don't process tap if it was a long press
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
    const relativeX = (clientX - rect.left) / rect.width;

    // Show tap feedback
    setTapFeedback({ x: clientX, y: clientY, id: Date.now() });
    setTimeout(() => setTapFeedback(null), 300);

    if (relativeX < 0.3 && currentPage > 1) {
      // Left tap zone - previous page
      goToPreviousPage();
    } else if (relativeX > 0.7 && currentPage < numPages) {
      // Right tap zone - next page
      goToNextPage();
    } else {
      // Center tap zone - toggle controls
      toggleControls();
    }
  };

  // Calculate page width for responsive display
  const getPageWidth = () => {
    if (isMobile) {
      // On mobile, use full container width for maximum readability
      // In immersive mode, use viewport width directly
      if (immersiveMode && containerRef.current) {
        return Math.max(window.innerWidth, 300);
      }
      return Math.max(containerWidth, 300);
    }
    return undefined; // Use scale on desktop
  };

  // Handle progress bar click for page jumping
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile || numPages === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetPage = Math.max(1, Math.min(Math.round(percentage * numPages), numPages));
    
    jumpToPage(targetPage);
    showControls();
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
      className={`flex flex-col h-full bg-background ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      } ${
        isMobile && immersiveMode ? "fixed inset-0 z-40" : ""
      }`}
    >
      {/* Desktop Controls bar */}
      {!isMobile && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1 || isLoading}
                className="h-9 w-9 p-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {isLoading ? "..." : `${currentPage} / ${numPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= numPages || isLoading}
                className="h-9 w-9 p-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5 || isLoading}
                className="h-9 w-9 p-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="text-sm font-medium min-w-[60px] h-9"
              >
                {Math.round(scale * 100)}%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 3 || isLoading}
                className="h-9 w-9 p-0"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
              
              {/* Fullscreen button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                disabled={isLoading}
                className="h-9 w-9 p-0"
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
      )}

      {/* Mobile Auto-hiding Top Controls Overlay */}
      {isMobile && !immersiveMode && (
        <div 
          className={`fixed top-0 left-0 right-0 z-20 transition-transform duration-300 ${
            controlsVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="bg-gradient-to-b from-black/70 to-transparent px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* Back button */}
              <Link href="/library">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-11 text-white hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Library
                </Button>
              </Link>

              {/* Page counter - tappable for page jump */}
              <button
                onClick={() => setShowPageJumpModal(true)}
                className="text-white font-medium text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors min-w-[90px]"
              >
                {isLoading ? "..." : `${currentPage} / ${numPages}`}
              </button>

              {/* Immersive mode button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleImmersiveMode}
                className="h-11 w-11 text-white hover:bg-white/20 p-0"
                title="Enter immersive mode"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Immersive mode exit button overlay */}
      {isMobile && immersiveMode && controlsVisible && (
        <div className="fixed top-4 right-4 z-30">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleImmersiveMode}
            className="h-11 w-11 bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm rounded-full p-0"
            title="Exit immersive mode"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      )}

      {/* PDF Document Container */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto relative ${
          isMobile && immersiveMode 
            ? 'bg-background py-0' 
            : isMobile 
            ? 'bg-muted/30 py-0' 
            : 'bg-muted/30 py-6'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <div className={`flex justify-center items-center min-h-full ${
          isMobile && immersiveMode 
            ? 'px-0 py-0' 
            : isMobile 
            ? 'px-0' 
            : 'px-4'
        }`}>
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
            className={isMobile && immersiveMode ? "" : isMobile ? "" : "shadow-lg rounded-lg overflow-hidden"}
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

        {/* Tap feedback indicator */}
        {tapFeedback && (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: tapFeedback.x,
              top: tapFeedback.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {tapFeedback.isLongPress ? (
              // Long press feedback - larger animation
              <>
                <div className="w-24 h-24 rounded-full bg-blue-500/40 animate-ping" />
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-blue-500/20 animate-pulse" />
              </>
            ) : (
              // Regular tap feedback
              <div className="w-16 h-16 rounded-full bg-white/30 animate-ping" />
            )}
          </div>
        )}

        {/* Immersive mode hint - shows briefly when entering */}
        {isMobile && immersiveMode && showImmersiveHint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-opacity duration-300">
            <div className="bg-black/80 text-white px-6 py-3 rounded-lg text-sm backdrop-blur-sm text-center shadow-lg">
              <div className="font-semibold mb-1">Immersive Mode</div>
              <div className="text-xs opacity-90">Tap center to show controls</div>
              <div className="text-xs opacity-90">Long press to exit</div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Progress Bar - Hidden in immersive mode */}
      {!immersiveMode && (
        <div 
          className={`bg-muted shrink-0 ${isMobile ? 'h-1 cursor-pointer' : 'h-1'}`}
          onClick={handleProgressBarClick}
        >
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${numPages > 0 ? (currentPage / numPages) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Page Jump Modal - Mobile only */}
      {isMobile && showPageJumpModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setShowPageJumpModal(false)}
        >
          <div 
            className="bg-background rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Jump to Page</h3>
            <input
              type="number"
              min="1"
              max={numPages}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              placeholder={`1-${numPages}`}
              className="w-full px-4 py-3 text-lg border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePageJumpSubmit();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPageJumpModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePageJumpSubmit}
                className="flex-1"
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Bottom Sheet */}
      <NotesBottomSheet
        pdfId={pdfId}
        pdfTitle={pdfTitle}
        currentPage={currentPage}
        userId={userId}
      />
    </div>
  );
}




