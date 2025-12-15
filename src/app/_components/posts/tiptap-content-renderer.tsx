"use client";

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
import "katex/dist/katex.min.css";

interface TipTapContentRendererProps {
  content: string;
}

export default function TipTapContentRenderer({ content }: TipTapContentRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-600 underline dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-600",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-600 px-4 py-2",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none pl-0",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Mathematics.configure({
        HTMLAttributes: {
          class: "math-inline",
        },
        katexOptions: {
          throwOnError: false,
        },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-content">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap-content .ProseMirror {
          outline: none;
        }
        
        .tiptap-content .math-node {
          display: inline-block;
          margin: 0 2px;
        }
        
        .tiptap-content .math-block {
          display: block;
          margin: 1em 0;
          text-align: center;
        }
        
        .tiptap-content table {
          border-collapse: collapse;
          table-layout: auto;
          width: 100%;
          margin: 1em 0;
          overflow: hidden;
        }
        
        .tiptap-content table td,
        .tiptap-content table th {
          border: 1px solid #ddd;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        
        .tiptap-content table th {
          background-color: #f3f4f6;
          font-weight: 600;
          text-align: left;
        }
        
        .dark .tiptap-content table th {
          background-color: #374151;
        }
        
        .dark .tiptap-content table td,
        .dark .tiptap-content table th {
          border-color: #4b5563;
        }
        
        .tiptap-content ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        
        .tiptap-content ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .tiptap-content ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.25rem;
          user-select: none;
        }
        
        .tiptap-content ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
      `}</style>
    </div>
  );
}

