import { getAllPosts } from "@/lib/api";
import { PostList } from "@/app/_components/post-list";
import { Intro } from "@/app/_components/intro";

export default async function BooksPage() {
  const allPosts = getAllPosts();
  const bookPosts = allPosts.filter((post) => post.category === "book");

  return (
    <div className="container mx-auto px-5">
      <Intro />
      <PostList posts={bookPosts} />
    </div>
  );
}
