"use client";

import { useState } from "react";
import { createQuickRefClient } from "@/lib/api-client";
import { CreateQuickRefInput } from "@/interfaces/quickref";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldGroup,
} from "@/app/_components/ui/field";

interface QuickRefFormProps {
  onSuccess?: () => void;
}

export default function QuickRefForm({ onSuccess }: QuickRefFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      const input: CreateQuickRefInput = {
        name: name.trim(),
        content: content.trim() || null,
        link: link.trim() || null,
        tag: tag.trim() || null,
      };

      await createQuickRefClient(input);
      setSuccess(true);
      setName("");
      setContent("");
      setLink("");
      setTag("");
      
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create quick ref");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create Quick Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Quick reference created successfully!
              </AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter quick reference name"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="content">Content</FieldLabel>
                <FieldDescription>
                  Add any additional details or notes (optional)
                </FieldDescription>
                <Textarea
                  id="content"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter content"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="link">Link</FieldLabel>
                <FieldDescription>
                  Add a related URL (optional)
                </FieldDescription>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="tag">Tag</FieldLabel>
                <FieldDescription>
                  Add a tag to categorize this reference (optional)
                </FieldDescription>
                <Input
                  id="tag"
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Enter tag"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Quick Reference"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

