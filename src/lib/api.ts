import { Post } from "@/interfaces/post";
import { QuickRef, CreateQuickRefInput, UpdateQuickRefInput } from "@/interfaces/quickref";
import { BlogPost } from "@/interfaces/blog-post";
import { supabase } from "./supabase";

// Table names in Supabase
const POSTS_TABLE = "blog_posts";
const AUTHORS_TABLE = "authors";
const TAGS_TABLE = "tags";
const CATEGORIES_TABLE = "categories";
const POST_TAGS_TABLE = "blog_post_tags";
const POST_CATEGORIES_TABLE = "blog_post_categories";

// Helper to convert Supabase row with joins to Post
function rowToPost(row: any, author?: any, tags?: any[], category?: any): Post {
  return {
    slug: row.slug || row.id || "",
    title: row.title || "",
    date: row.date 
      ? (typeof row.date === "string" 
          ? row.date 
          : new Date(row.date).toISOString())
      : row.created_at 
        ? (typeof row.created_at === "string"
            ? row.created_at
            : new Date(row.created_at).toISOString())
        : "",
    coverImage: row.cover_image || row.coverImage || "",
    author: author 
      ? { name: author.name || "", picture: author.picture || "" }
      : { name: "", picture: "" },
    excerpt: row.excerpt || "",
    ogImage: row.og_image 
      ? (typeof row.og_image === "object" ? row.og_image : { url: row.og_image })
      : { url: "" },
    content: row.content || "",
    preview: row.preview || false,
    tags: tags?.map(t => t.name || t) || [],
    category: category?.name || category || "",
  };
}

export async function getPostSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("slug, id");

  if (error) {
    console.error("Error fetching post slugs:", error);
    return [];
  }

  return data?.map((row) => row.slug || row.id) || [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Fetch the post
  const { data: post, error: postError } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .eq("slug", slug)
    .single();

  if (postError || !post) {
    if (postError?.code !== "PGRST116") { // PGRST116 is "not found" error
      console.error("Error fetching post by slug:", postError);
    }
    return null;
  }

  // Fetch author if author_id exists
  let author = null;
  if (post.author_id) {
    const { data: authorData } = await supabase
      .from(AUTHORS_TABLE)
      .select("*")
      .eq("id", post.author_id)
      .single();
    author = authorData;
  }

  // Fetch tags via junction table
  const { data: postTags } = await supabase
    .from(POST_TAGS_TABLE)
    .select(`
      ${TAGS_TABLE} (*)
    `)
    .eq("blog_post_id", post.id);

  const tags = postTags?.map((pt: any) => pt.tags || pt.tag) || [];

  // Fetch category via junction table
  let category = null;
  const { data: postCategory } = await supabase
    .from(POST_CATEGORIES_TABLE)
    .select(`
      ${CATEGORIES_TABLE} (*)
    `)
    .eq("blog_post_id", post.id)
    .limit(1)
    .single();

  category = (postCategory as any)?.categories || (postCategory as any)?.category || postCategory || null;

  return rowToPost(post, author, tags, category);
}

export async function getAllPosts(): Promise<Post[]> {
  const { data: posts, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  // Fetch all related data in parallel
  const postsWithRelations = await Promise.all(
    posts.map(async (post) => {
      // Fetch author
      let author = null;
      if (post.author_id) {
        const { data: authorData } = await supabase
          .from(AUTHORS_TABLE)
          .select("*")
          .eq("id", post.author_id)
          .single();
        author = authorData;
      }

      // Fetch tags
      const { data: postTags } = await supabase
        .from(POST_TAGS_TABLE)
        .select(`
          ${TAGS_TABLE} (*)
        `)
        .eq("blog_post_id", post.id);

      const tags = postTags?.map((pt: any) => pt.tags || pt.tag).filter(Boolean) || [];

      // Fetch category
      const { data: postCategory } = await supabase
        .from(POST_CATEGORIES_TABLE)
        .select(`
          ${CATEGORIES_TABLE} (*)
        `)
        .eq("blog_post_id", post.id)
        .limit(1)
        .single();

      const categoryData = postCategory as any;
      const category = categoryData?.categories || categoryData?.category || categoryData || null;

      return rowToPost(post, author, tags, category);
    })
  );

  return postsWithRelations;
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  // First, find the tag by name
  const { data: tagData, error: tagError } = await supabase
    .from(TAGS_TABLE)
    .select("id")
    .eq("name", tag)
    .single();

  if (tagError || !tagData) {
    // Fallback: fetch all posts and filter client-side
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => post.tags?.includes(tag) || false);
  }

  // Get all post IDs with this tag
  const { data: postTags, error: postTagsError } = await supabase
    .from(POST_TAGS_TABLE)
    .select("blog_post_id")
    .eq("tag_id", tagData.id);

  if (postTagsError || !postTags || postTags.length === 0) {
    return [];
  }

  const postIds = postTags.map((pt: any) => pt.blog_post_id);

  // Fetch posts
  const { data: posts, error: postsError } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .in("id", postIds)
    .order("created_at", { ascending: false });

  if (postsError || !posts) {
    console.error("Error fetching posts by tag:", postsError);
    return [];
  }

  // Fetch all related data
  const postsWithRelations = await Promise.all(
    posts.map(async (post) => {
      let author = null;
      if (post.author_id) {
        const { data: authorData } = await supabase
          .from(AUTHORS_TABLE)
          .select("*")
          .eq("id", post.author_id)
          .single();
        author = authorData;
      }

      const { data: postTags } = await supabase
        .from(POST_TAGS_TABLE)
        .select(`
          ${TAGS_TABLE} (*)
        `)
        .eq("blog_post_id", post.id);

      const tags = postTags?.map((pt: any) => pt.tags || pt.tag).filter(Boolean) || [];

      const { data: postCategory } = await supabase
        .from(POST_CATEGORIES_TABLE)
        .select(`
          ${CATEGORIES_TABLE} (*)
        `)
        .eq("blog_post_id", post.id)
        .limit(1)
        .single();

      const categoryData = postCategory as any;
      const category = categoryData?.categories || categoryData?.category || categoryData || null;

      return rowToPost(post, author, tags, category);
    })
  );

  return postsWithRelations;
}

export async function getAWPosts(): Promise<Post[]> {
  return getPostsByTag("aw");
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const allTags = allPosts
    .flatMap((post) => post.tags || [])
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
    .sort(); // Sort alphabetically

  return allTags;
}

export async function getTagWithPostCount(): Promise<
  { tag: string; count: number }[]
> {
  const allPosts = await getAllPosts();
  const tagCounts: { [key: string]: number } = {};

  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

// Quick Reference functions
const QUICK_REF_TABLE = "quick_ref";

export async function getAllQuickRefs(): Promise<QuickRef[]> {
  const { data, error } = await supabase
    .from(QUICK_REF_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quick refs:", error);
    return [];
  }

  return data || [];
}

export async function getQuickRefById(id: string): Promise<QuickRef | null> {
  const { data, error } = await supabase
    .from(QUICK_REF_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching quick ref by id:", error);
    return null;
  }

  return data;
}

export async function createQuickRef(input: CreateQuickRefInput): Promise<QuickRef | null> {
  const { data, error } = await supabase
    .from(QUICK_REF_TABLE)
    .insert({
      name: input.name,
      content: input.content || null,
      link: input.link || null,
      tag: input.tag || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating quick ref:", error);
    throw error;
  }

  return data;
}

export async function updateQuickRef(
  id: string,
  input: UpdateQuickRefInput
): Promise<QuickRef | null> {
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.link !== undefined) updateData.link = input.link;
  if (input.tag !== undefined) updateData.tag = input.tag;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(QUICK_REF_TABLE)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating quick ref:", error);
    throw error;
  }

  return data;
}

export async function deleteQuickRef(id: string): Promise<boolean> {
  const { error } = await supabase
    .from(QUICK_REF_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting quick ref:", error);
    throw error;
  }

  return true;
}

// Blog Posts Functions (for new blog_posts table)
export async function getAllBlogPostsServer(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data || [];
}

export async function getBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // Not found error
      console.error("Error fetching blog post:", error);
    }
    return null;
  }

  return data;
}

export async function incrementBlogPostViewCountServer(id: number): Promise<void> {
  // Direct update instead of RPC for simplicity
  const { data: currentPost } = await supabase
    .from(POSTS_TABLE)
    .select("view_count")
    .eq("id", id)
    .single();

  if (currentPost) {
    const { error } = await supabase
      .from(POSTS_TABLE)
      .update({ view_count: (currentPost.view_count || 0) + 1 })
      .eq("id", id);

    if (error) {
      console.error("Error incrementing view count:", error);
    }
  }
}

export async function updateBlogPostServer(
  id: number,
  data: Partial<BlogPost>
): Promise<BlogPost | null> {
  const updateData: any = { ...data };
  // Always update updated_at timestamp
  updateData.updated_at = new Date().toISOString();
  // Don't update created_at
  delete updateData.created_at;

  const { data: updatedPost, error } = await supabase
    .from(POSTS_TABLE)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }

  return updatedPost;
}

export async function deleteBlogPostServer(id: number): Promise<boolean> {
  // First, delete related blog_images
  const { error: imageError } = await supabase
    .from("blog_images")
    .delete()
    .eq("blog_post_id", id);

  if (imageError) {
    console.error("Error deleting blog images:", imageError);
    // Continue with post deletion even if image deletion fails
  }

  // Then delete the blog post
  const { error } = await supabase
    .from(POSTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }

  return true;
}

