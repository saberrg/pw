import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import DateFormatter from "@/app/_components/date-formatter";
import { getBlogPostBySlugServer, incrementBlogPostViewCountServer } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";

type Props = {
  params: { slug: string };
};

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlugServer(resolvedParams.slug);

  if (!post || post.status !== "published") {
    return notFound();
  }

  // Increment view count
  if (post.id) {
    await incrementBlogPostViewCountServer(post.id);
  }

  // Convert content to HTML (if it's markdown)
  const content = await markdownToHtml(post.content || "");

  return (
    <main>
      <Container>
        <article className="mb-32">
          {/* Header */}
          <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <DateFormatter dateString={post.published_at} />
              <span>•</span>
              <span>{post.view_count} views</span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary hover:prose-a:text-primary/80 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-code:text-gray-900 dark:prose-code:text-gray-100"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </Container>
    </main>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlugServer(resolvedParams.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      type: "article",
      publishedTime: post.published_at || undefined,
    },
  };
}

