import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { LibraryContent } from "./_components/library-content";
import { UploadPdfDialog } from "./_components/upload-pdf-dialog";

export interface PdfWithProgress {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_url: string | null;
  created_at: string;
  current_page?: number;
  total_pages?: number;
  last_read_at?: string;
}

export default async function LibraryPage() {
  const { user } = await getCurrentUser();
  
  if (!user) {
    redirect("/gg");
  }

  const supabase = await createClient();

  // Fetch all PDFs
  const { data: pdfs, error: pdfsError } = await supabase
    .from("pdf_library")
    .select("*")
    .order("created_at", { ascending: false });

  if (pdfsError) {
    console.error("Error fetching PDFs:", pdfsError);
  }

  // Fetch user's progress for all PDFs
  const { data: progress, error: progressError } = await supabase
    .from("user_pdf_progress")
    .select("*")
    .eq("user_id", user.id);

  if (progressError) {
    console.error("Error fetching progress:", progressError);
  }

  // Merge PDFs with progress
  const pdfsWithProgress: PdfWithProgress[] = (pdfs || []).map((pdf) => {
    const userProgress = progress?.find((p) => p.pdf_id === pdf.id);
    return {
      ...pdf,
      current_page: userProgress?.current_page,
      total_pages: userProgress?.total_pages,
      last_read_at: userProgress?.last_read_at,
    };
  });

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-2">
            Your personal PDF collection. Pick up where you left off.
          </p>
        </div>
        <UploadPdfDialog />
      </div>

      {pdfsWithProgress.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-muted-foreground">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-lg font-medium">No PDFs yet</p>
            <p className="text-sm">PDFs will appear here once added to the library.</p>
          </div>
        </div>
      ) : (
        <LibraryContent pdfs={pdfsWithProgress} />
      )}
    </div>
  );
}
