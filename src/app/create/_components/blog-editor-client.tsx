"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "./blog-editor";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { toast } from "sonner";
import { BlogPost } from "@/interfaces/blog-post";
import { updateBlogPostClient } from "@/lib/api-client";

interface BlogEditorClientProps {
  userId: string;
  initialPost?: BlogPost;
}

export default function BlogEditorClient({ userId, initialPost }: BlogEditorClientProps) {
  const router = useRouter();
  const isEditMode = !!initialPost;
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || "");
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode);

  // Initialize form when initialPost changes
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || "");
      setSlug(initialPost.slug || "");
      setExcerpt(initialPost.excerpt || "");
      setContent(initialPost.content || "");
      setMetaTitle(initialPost.meta_title || "");
      setMetaDescription(initialPost.meta_description || "");
      setSlugManuallyEdited(true);
    }
  }, [initialPost]);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      const autoSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  };

  const extractImagesFromContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");
    return Array.from(images).map((img, index) => ({
      src: img.src,
      alt: img.alt || "",
      order: index,
    }));
  };

  const handleSave = async (publishNow = false) => {
    if (!title || !slug) {
      toast.error("Please provide a title and slug");
      return;
    }

    if (publishNow && !content) {
      toast.error("Cannot publish an empty post");
      return;
    }

    setSaving(true);

    try {
      const postData: any = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        author_id: userId,
        status: publishNow ? "published" : "draft",
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
      };

      // Handle published_at: set if publishing, preserve if already published and saving as draft
      if (publishNow) {
        postData.published_at = new Date().toISOString();
      } else if (isEditMode && initialPost?.published_at) {
        // Preserve existing published_at if saving as draft
        postData.published_at = initialPost.published_at;
      } else {
        postData.published_at = null;
      }

      if (isEditMode && initialPost?.id) {
        // Update existing post
        const updatedPost = await updateBlogPostClient(initialPost.id, postData);
        
        if (!updatedPost) {
          throw new Error("Failed to update blog post");
        }

        // Delete old images
        const { error: deleteImageError } = await supabaseAuth
          .from("blog_images")
          .delete()
          .eq("blog_post_id", initialPost.id);

        if (deleteImageError) {
          console.error("Error deleting old images:", deleteImageError);
          // Continue with image insertion
        }

        // Extract and save new images
        if (content) {
          const images = extractImagesFromContent(content);
          if (images.length > 0) {
            const imageRecords = images.map((img) => ({
              blog_post_id: initialPost.id,
              image_order: img.order,
              file_path: img.src,
              alt_text: img.alt,
              file_name: img.src.split("/").pop() || "",
            }));

            const { error: imageError } = await supabaseAuth
              .from("blog_images")
              .insert(imageRecords);

            if (imageError) {
              console.error("Error saving images:", imageError);
              // Don't fail the whole operation if images fail
            }
          }
        }

        toast.success(publishNow ? "Post updated and published!" : "Post updated successfully!");
        
        // Redirect to blog post
        if (publishNow) {
          router.push(`/blog/${updatedPost.slug}`);
        } else {
          router.push(`/blog/${updatedPost.slug}`);
        }
      } else {
        // Insert new blog post
        const { data: post, error: saveError } = await supabaseAuth
          .from("blog_posts")
          .insert(postData)
          .select()
          .single();

        if (saveError) throw saveError;

        // Extract and save images
        if (content) {
          const images = extractImagesFromContent(content);
          if (images.length > 0) {
            const imageRecords = images.map((img) => ({
              blog_post_id: post.id,
              image_order: img.order,
              file_path: img.src,
              alt_text: img.alt,
              file_name: img.src.split("/").pop() || "",
            }));

            const { error: imageError } = await supabaseAuth
              .from("blog_images")
              .insert(imageRecords);

            if (imageError) {
              console.error("Error saving images:", imageError);
              // Don't fail the whole operation if images fail
            }
          }
        }

        toast.success(publishNow ? "Post published successfully!" : "Draft saved successfully!");
        
        // Redirect to blog post
        if (publishNow) {
          router.push(`/blog/${post.slug}`);
        } else {
          // For drafts, we could redirect to an edit page
          router.push(`/`);
        }
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "save"} blog post`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter blog post title"
          required
          className="mt-2"
        />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugManuallyEdited(true);
          }}
          placeholder="blog-post-url"
          required
          disabled={isEditMode}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          URL: /blog/{slug || "your-slug"}
          {isEditMode && " (read-only)"}
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary for preview cards"
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Rich Text Editor */}
      <div>
        <Label>Content *</Label>
        <div className="mt-2">
          <BlogEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* SEO Fields */}
      <details className="border rounded-lg p-4 dark:border-slate-700">
        <summary className="cursor-pointer font-medium dark:text-white">
          SEO Settings (Optional)
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title (defaults to post title)"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description"
              rows={3}
              className="mt-2"
            />
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t dark:border-slate-700">
        <Button
          onClick={() => handleSave(false)}
          disabled={!title || !slug || saving}
          variant="outline"
        >
          {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update Draft" : "Save Draft")}
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={!title || !slug || !content || saving}
        >
          {saving ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update & Publish" : "Publish")}
        </Button>
      </div>
    </div>
  );
}



