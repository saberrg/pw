import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { PdfViewerWrapper } from "../_components/pdf-viewer-wrapper";
import { Button } from "@/app/_components/ui/button";

interface PageProps {
  params: Promise<{ pdfId: string }>;
}

export default async function PdfViewerPage({ params }: PageProps) {
  const { pdfId } = await params;
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/gg");
  }

  const supabase = await createClient();

  // Fetch PDF metadata
  const { data: pdf, error: pdfError } = await supabase
    .from("pdf_library")
    .select("*")
    .eq("id", pdfId)
    .single();

  if (pdfError || !pdf) {
    notFound();
  }

  // Fetch user's progress for this PDF
  const { data: progress } = await supabase
    .from("user_pdf_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("pdf_id", pdfId)
    .single();

  // Generate signed URL for the PDF (1 hour expiry)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("library")
    .createSignedUrl(pdf.file_path, 3600);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error("Error generating signed URL:", signedUrlError);
    return (
      <div className="container mx-auto px-5 py-10">
        <div className="text-center py-20">
          <p className="text-destructive mb-4">Failed to load PDF. Please try again.</p>
          <Link href="/library">
            <Button>Back to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialPage = progress?.current_page || 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/library">
            <Button variant="ghost" size="sm">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Library
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold truncate">{pdf.title}</h1>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1">
        <PdfViewerWrapper
          pdfId={pdfId}
          pdfUrl={signedUrlData.signedUrl}
          pdfTitle={pdf.title}
          initialPage={initialPage}
          userId={user.id}
        />
      </div>
    </div>
  );
}
