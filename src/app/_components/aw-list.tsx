"use client";
import { Post } from "@/interfaces/post";
import { ReactNode } from "react";
import Link from "next/link";

interface AWItem {
  title: string;
  description: string;
  type: "audio" | "writing";
  link?: string;
}

interface AWListProps {
  items: Post[];
  title?: string;
}

function getIcon(type: "audio" | "writing"): ReactNode {
  if (type === "audio") {
    // Speaker icon
    return (
      <span className="mr-2 text-blue-500" title="Audio" aria-label="Audio">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4l4 4V3l-4 4z"/></svg>
      </span>
    );
  }
  // Document icon
  return (
    <span className="mr-2 text-green-500" title="Writing" aria-label="Writing">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M17 6.41V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h6.59A2 2 0 0 1 13 1.59l4.41 4.41A2 2 0 0 1 17 6.41zM13 3.5V7a1 1 0 0 0 1 1h3.5L13 3.5z"/></svg>
    </span>
  );
}

export function AWList({ items, title }: AWListProps) {
  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="space-y-6">
        {items.map((post) => {
          // Determine if the post is audio or writing based on tags
          const type = post.tags?.includes('audio') ? 'audio' : 'writing';
          
          return (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                {getIcon(type)}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-0">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 