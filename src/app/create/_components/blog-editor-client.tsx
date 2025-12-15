"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "./blog-editor";
import { supabaseAuth } from "@/lib/supabase-auth";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { toast } from "sonner";

interface BlogEditorClientProps {
  userId: string;
}

export default function BlogEditorClient({ userId }: BlogEditorClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
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
      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        author_id: userId,
        status: publishNow ? "published" : "draft",
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        published_at: publishNow ? new Date().toISOString() : null,
      };

      // Insert blog post
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
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save blog post");
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
          onChange={(e) => setSlug(e.target.value)}
          placeholder="blog-post-url"
          required
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          URL: /blog/{slug || "your-slug"}
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
          {saving ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={!title || !slug || !content || saving}
        >
          {saving ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}



