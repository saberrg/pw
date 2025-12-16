"use client";

import { QuickRef, CreateQuickRefInput, UpdateQuickRefInput } from "@/interfaces/quickref";
import { BlogPost } from "@/interfaces/blog-post";
import { supabaseAuth } from "./supabase-auth";

const QUICK_REF_TABLE = "quick_ref";
const BLOG_POSTS_TABLE = "blog_posts";

export async function getAllQuickRefsClient(): Promise<QuickRef[]> {
  const { data, error } = await supabaseAuth
    .from(QUICK_REF_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quick refs:", error);
    return [];
  }

  return data || [];
}

export async function createQuickRefClient(input: CreateQuickRefInput): Promise<QuickRef | null> {
  const { data, error } = await supabaseAuth
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

export async function updateQuickRefClient(
  id: string,
  input: UpdateQuickRefInput
): Promise<QuickRef | null> {
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.link !== undefined) updateData.link = input.link;
  if (input.tag !== undefined) updateData.tag = input.tag;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAuth
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

export async function deleteQuickRefClient(id: string): Promise<boolean> {
  const { error } = await supabaseAuth
    .from(QUICK_REF_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting quick ref:", error);
    throw error;
  }

  return true;
}

// Blog Posts Functions
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabaseAuth
    .from(BLOG_POSTS_TABLE)
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data || [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAuth
    .from(BLOG_POSTS_TABLE)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }

  return data;
}

export async function incrementBlogPostViewCount(id: number): Promise<void> {
  const { error } = await supabaseAuth.rpc("increment_blog_view_count", {
    post_id: id,
  });

  if (error) {
    console.error("Error incrementing view count:", error);
  }
}

export async function updateBlogPostClient(
  id: number,
  data: Partial<BlogPost>
): Promise<BlogPost | null> {
  const updateData: any = { ...data };
  // Always update updated_at timestamp
  updateData.updated_at = new Date().toISOString();
  // Don't update created_at
  delete updateData.created_at;

  const { data: updatedPost, error } = await supabaseAuth
    .from(BLOG_POSTS_TABLE)
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

export async function deleteBlogPostClient(id: number): Promise<boolean> {
  // First, delete related blog_images
  const { error: imageError } = await supabaseAuth
    .from("blog_images")
    .delete()
    .eq("blog_post_id", id);

  if (imageError) {
    console.error("Error deleting blog images:", imageError);
    // Continue with post deletion even if image deletion fails
  }

  // Then delete the blog post
  const { error } = await supabaseAuth
    .from(BLOG_POSTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }

  return true;
}

