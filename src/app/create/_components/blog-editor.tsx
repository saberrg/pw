"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Mathematics from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./editor-toolbar";
import { supabaseAuth } from "@/lib/supabase-auth";
import { toast } from "sonner";
import "katex/dist/katex.min.css";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Create custom extensions with unique names to avoid duplicate warnings
// This is needed because Tiptap v3 may detect duplicates during HMR
const CustomLink = Link.extend({
  name: 'customLink',
});

const CustomUnderline = Underline.extend({
  name: 'customUnderline',
});

// Define extensions outside component to prevent recreation on each render
const editorExtensions = [
  StarterKit.configure({
    // Explicitly configure to avoid any potential conflicts
  }),
  CustomUnderline,
  CustomLink.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-600 underline dark:text-blue-400",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "max-w-full h-auto rounded-lg",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Table,
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Mathematics,
  Placeholder.configure({
    placeholder: "Start writing your blog post...",
  }),
];

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5MB");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAuth.storage
      .from("blog-posts")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabaseAuth.storage
      .from("blog-posts")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none dark:prose-invert min-h-[500px] px-4 py-3",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        // Check if clipboard contains an image
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (!file) return false;

            // Handle async upload without blocking
            setUploading(true);
            
            uploadImageToSupabase(file)
              .then((imageUrl) => {
                // Insert image at cursor position
                if (editor) {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                  toast.success("Image pasted and uploaded!");
                }
              })
              .catch((err: any) => {
                console.error("Upload error:", err);
                toast.error(err.message || "Failed to upload image");
              })
              .finally(() => {
                setUploading(false);
              });
            
            return true; // Handled the paste event
          }
        }
        
        return false; // Let TipTap handle other paste events
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg dark:border-slate-700 overflow-hidden">
      <EditorToolbar editor={editor} />
      <div className="bg-white dark:bg-slate-800 relative">
        {uploading && (
          <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading image...
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

