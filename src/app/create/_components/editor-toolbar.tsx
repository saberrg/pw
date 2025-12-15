"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code2,
  CheckSquare,
} from "lucide-react";
import { useState } from "react";
import { Toggle } from "@/app/_components/ui/toggle";
import { Separator } from "@/app/_components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import ImageUploadDialog from "./image-upload-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleImageInsert = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImageDialog(false);
  };

  const handleSetLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkPopover(false);
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkPopover(false);
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertEquation = () => {
    const latex = prompt("Enter LaTeX equation:");
    if (latex) {
      // Remove LaTeX delimiters if present
      let cleanLatex = latex.trim();
      
      // Check if it's block math (\[...\])
      if (cleanLatex.startsWith("\\[") && cleanLatex.endsWith("\\]")) {
        cleanLatex = cleanLatex.slice(2, -2).trim();
        editor.chain().focus().insertBlockMath({ latex: cleanLatex }).run();
      }
      // Check if it's inline math ($...$)
      else if (cleanLatex.startsWith("$") && cleanLatex.endsWith("$")) {
        cleanLatex = cleanLatex.slice(1, -1).trim();
        editor.chain().focus().insertInlineMath({ latex: cleanLatex }).run();
      }
      // Default to block math if no delimiters
      else {
        editor.chain().focus().insertBlockMath({ latex: cleanLatex }).run();
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="border-b dark:border-slate-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-slate-900">
        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("underline")}
              onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("strike")}
              onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("code")}
              onPressedChange={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Inline Code</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 1 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 2 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 3 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("bulletList")}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("orderedList")}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("taskList")}
              onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Task List</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "left" })}
              onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "center" })}
              onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "right" })}
              onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Other */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("blockquote")}
              onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Quote</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("codeBlock")}
              onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code2 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Code Block</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Image</TooltipContent>
        </Tooltip>

        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("link")}
                >
                  <LinkIcon className="h-4 w-4" />
                </Toggle>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
              />
              <div className="flex gap-2">
                <Button onClick={handleSetLink} size="sm" className="flex-1">
                  Set Link
                </Button>
                {editor.isActive("link") && (
                  <Button onClick={handleRemoveLink} size="sm" variant="destructive">
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Table</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertEquation}
            >
              <span className="font-mono text-sm">∑</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Equation (LaTeX)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        {/* Image Upload Dialog */}
        <ImageUploadDialog
          open={showImageDialog}
          onOpenChange={setShowImageDialog}
          onImageInsert={handleImageInsert}
        />
      </div>
    </TooltipProvider>
  );
}

