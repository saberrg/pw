export interface QuickRef {
  id: string;
  name: string;
  content: string | null;
  link: string | null;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuickRefInput {
  name: string;
  content?: string | null;
  link?: string | null;
  tag?: string | null;
}

export interface UpdateQuickRefInput {
  name?: string;
  content?: string | null;
  link?: string | null;
  tag?: string | null;
}


