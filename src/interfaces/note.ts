export interface Note {
  id: string;
  pdf_id: string;
  user_id: string;
  page_number: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteWithPdf extends Note {
  pdf_title: string;
  pdf_description?: string | null;
}

export interface NoteWithAuthor extends Note {
  author_email?: string;
}

export interface NoteWithPdfAndAuthor extends NoteWithPdf {
  author_email?: string;
}




