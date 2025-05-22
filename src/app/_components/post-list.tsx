import { Post } from "@/interfaces/post";
import { PostPreview } from "./posts/post-preview";
import Link from "next/link";

type Props = {
  posts: Post[];
  title?: string;
};

export function PostList({ posts, title }: Props) {
  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <PostPreview
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          </Link>
        ))}
      </div>
    </div>
  );
} 