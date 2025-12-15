import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import BlogEditorClient from "./_components/blog-editor-client";

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export default async function CreateBlogPostPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (error || !user) {
    redirect("/gg?redirect=/create");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Create New Blog Post</h1>
        <BlogEditorClient userId={user.id} />
      </div>
    </div>
  );
}

