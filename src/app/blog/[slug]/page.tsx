import { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/_components/container";
import DateFormatter from "@/app/_components/date-formatter";
import { getBlogPostBySlugServer, incrementBlogPostViewCountServer } from "@/lib/api";
import TipTapContentRenderer from "@/app/_components/posts/tiptap-content-renderer";

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

  return (
    <main>
      <Container>
        <article className="mb-32">
          {/* Header */}
          <header className="mb-8 pb-8 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <DateFormatter dateString={post.published_at} />
              <span>•</span>
              <span>{post.view_count} views</span>
            </div>
          </header>

          {/* Content */}
          <TipTapContentRenderer content={post.content || ""} />
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

