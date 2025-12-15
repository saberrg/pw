"use client";

import { QuickRef } from "@/interfaces/quickref";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/supabase-auth";
import { deleteQuickRefClient, updateQuickRefClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/_components/ui/accordion";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldGroup,
} from "@/app/_components/ui/field";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";

interface QuickRefAccordionItemProps {
  quickRef: QuickRef;
  onUpdate?: () => void;
}

export default function QuickRefAccordionItem({
  quickRef,
  onUpdate,
}: QuickRefAccordionItemProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(quickRef.name);
  const [content, setContent] = useState(quickRef.content || "");
  const [link, setLink] = useState(quickRef.link || "");
  const [tag, setTag] = useState(quickRef.tag || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user } = await getUser();
      setIsAuthenticated(!!user);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(quickRef.name);
    setContent(quickRef.content || "");
    setLink(quickRef.link || "");
    setTag(quickRef.tag || "");
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateQuickRefClient(quickRef.id, {
        name: name.trim(),
        content: content.trim() || null,
        link: link.trim() || null,
        tag: tag.trim() || null,
      });
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update quick ref");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quick reference?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteQuickRefClient(quickRef.id);
      if (onUpdate) {
        onUpdate();
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete quick ref");
      setIsDeleting(false);
    }
  };

  return (
    <AccordionItem value={quickRef.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2 text-left">
          <span className="font-semibold">{quickRef.name}</span>
          {quickRef.tag && (
            <Badge variant="secondary" className="ml-2">
              {quickRef.tag}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isEditing ? (
          <div className="space-y-6 pt-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor={`name-${quickRef.id}`}>
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={`name-${quickRef.id}`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <FieldLabel htmlFor={`content-${quickRef.id}`}>
                    Content
                  </FieldLabel>
                  <Textarea
                    id={`content-${quickRef.id}`}
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <FieldLabel htmlFor={`link-${quickRef.id}`}>
                    Link
                  </FieldLabel>
                  <Input
                    id={`link-${quickRef.id}`}
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <FieldLabel htmlFor={`tag-${quickRef.id}`}>Tag</FieldLabel>
                  <Input
                    id={`tag-${quickRef.id}`}
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading || !name.trim()}
                size="sm"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {quickRef.content && (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {quickRef.content}
              </p>
            )}

            {quickRef.link && (
              <div>
                <a
                  href={quickRef.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline underline-offset-4 break-all"
                >
                  {quickRef.link}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>
                Created: {new Date(quickRef.created_at).toLocaleDateString()}
              </span>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

