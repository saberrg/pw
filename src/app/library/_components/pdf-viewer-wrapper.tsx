"use client";

import dynamic from "next/dynamic";

// Dynamically import the entire PDF viewer with SSR disabled
// This prevents any react-pdf code from running on the server
const PdfViewerClient = dynamic(
  () => import("./pdf-viewer-client").then((mod) => mod.PdfViewerClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    ),
  }
);

interface PdfViewerWrapperProps {
  pdfId: string;
  pdfUrl: string;
  pdfTitle: string;
  initialPage: number;
  userId: string;
}

export function PdfViewerWrapper(props: PdfViewerWrapperProps) {
  return <PdfViewerClient {...props} />;
}
