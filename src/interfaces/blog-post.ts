export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: number | null;
  status: 'draft' | 'published' | 'archived';
  featured_image_id: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id?: number;
  status?: 'draft' | 'published' | 'archived';
  featured_image_id?: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
}

