import { Post } from "@/interfaces/post";
import { PostPreview } from "./posts/post-preview";

type Props = {
  posts: Post[];
};

export function PostList({ posts }: Props) {
  return (
    <section>
      <h2 className="mb-8 text-4xl font-bold tracking-tighter leading-tight">
        Latest Posts
      </h2>
      <div className="space-y-8">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  );
} 