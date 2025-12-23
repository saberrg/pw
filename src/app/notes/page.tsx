import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { NotesList } from "./_components/notes-list";
import { NotesFilter } from "./_components/notes-filter";
import type { NoteWithPdfAndAuthor } from "@/interfaces/note";

interface NotesPageProps {
  searchParams: Promise<{ pdf?: string; q?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const { user } = await getCurrentUser();
  const supabase = await createClient();

  // Build the query
  let query = supabase
    .from("pdf_notes")
    .select(`
      *,
      pdf_library!inner (
        id,
        title,
        description
      )
    `)
    .order("created_at", { ascending: false });

  // Apply filters
  if (params.pdf) {
    query = query.eq("pdf_id", params.pdf);
  }

  if (params.q) {
    query = query.ilike("content", `%${params.q}%`);
  }

  const { data: notes, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
  }

  // Transform notes to match our interface
  const transformedNotes: NoteWithPdfAndAuthor[] = (notes || []).map((note: any) => ({
    id: note.id,
    pdf_id: note.pdf_id,
    user_id: note.user_id,
    page_number: note.page_number,
    content: note.content,
    created_at: note.created_at,
    updated_at: note.updated_at,
    pdf_title: note.pdf_library.title,
    pdf_description: note.pdf_library.description,
  }));

  // Get unique PDFs for filter dropdown
  const { data: pdfsWithNotes } = await supabase
    .from("pdf_notes")
    .select(`
      pdf_id,
      pdf_library!inner (
        id,
        title
      )
    `);

  const uniquePdfs = new Map<string, { id: string; title: string }>();
  for (const item of pdfsWithNotes || []) {
    if (!uniquePdfs.has(item.pdf_id)) {
      uniquePdfs.set(item.pdf_id, {
        id: (item.pdf_library as any).id,
        title: (item.pdf_library as any).title,
      });
    }
  }

  const pdfOptions = Array.from(uniquePdfs.values());

  return (
    <div className="container mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Reading Notes</h1>
        <p className="text-muted-foreground mt-2">
          Notes and insights from the community while reading PDFs.
        </p>
      </div>

      <NotesFilter
        pdfOptions={pdfOptions}
        currentPdf={params.pdf}
        currentSearch={params.q}
      />

      <NotesList
        notes={transformedNotes}
        currentUserId={user?.id}
      />
    </div>
  );
}




