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

