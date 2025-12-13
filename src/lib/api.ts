import { Post } from "@/interfaces/post";
import { supabase } from "./supabase";

// Table name in Supabase
const POSTS_TABLE = "posts";

// Helper to convert Supabase row to Post
function rowToPost(row: any): Post {
  return {
    slug: row.slug || row.id || "",
    title: row.title || "",
    date: row.date ? (typeof row.date === "string" ? row.date : row.date.toISOString()) : "",
    coverImage: row.coverImage || "",
    author: row.author || { name: "", picture: "" },
    excerpt: row.excerpt || "",
    ogImage: row.ogImage || { url: "" },
    content: row.content || "",
    preview: row.preview || false,
    tags: row.tags || [],
    category: row.category || "",
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
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (error?.code !== "PGRST116") { // PGRST116 is "not found" error
      console.error("Error fetching post by slug:", error);
    }
    return null;
  }

  return rowToPost(data);
}

export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }

  return data?.map((row) => rowToPost(row)) || [];
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from(POSTS_TABLE)
    .select("*")
    .contains("tags", [tag])
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching posts by tag:", error);
    // Fallback: fetch all posts and filter client-side if Supabase query fails
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => post.tags?.includes(tag) || false);
  }

  return data?.map((row) => rowToPost(row)) || [];
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
