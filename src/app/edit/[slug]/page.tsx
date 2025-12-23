import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getBlogPostBySlugServer } from "@/lib/api";
import BlogEditorClient from "@/app/create/_components/blog-editor-client";

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
};

export default async function EditBlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (error || !user) {
    redirect("/gg?redirect=/edit/" + resolvedParams.slug);
  }

  // Fetch the blog post
  const post = await getBlogPostBySlugServer(resolvedParams.slug);

  if (!post) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Edit Blog Post</h1>
        <BlogEditorClient userId={user.id} initialPost={post} />
      </div>
    </div>
  );
}






