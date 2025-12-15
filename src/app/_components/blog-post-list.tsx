"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/interfaces/blog-post";
import { getAllBlogPosts } from "@/lib/api-client";
import DateFormatter from "./date-formatter";

interface BlogPostListProps {
  initialPosts?: BlogPost[];
  title?: string;
}

export function BlogPostList({ initialPosts = [], title }: BlogPostListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);

  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Loading blog posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No blog posts published yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-50">
          {title}
        </h2>
      )}
      <div className="space-y-1">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group py-6 px-4 -mx-4 rounded-lg border-l-4 border-transparent hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-accent/50 dark:hover:bg-zinc-800/50 transition-all duration-200"
          >
            <article>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-zinc-50 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                {post.title}
              </h3>
              <div className="text-sm text-muted-foreground mb-3">
                <DateFormatter dateString={post.published_at} />
              </div>
              {post.excerpt && (
                <p className="text-base leading-relaxed text-gray-600 dark:text-zinc-400 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

