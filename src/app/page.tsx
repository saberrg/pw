import Container from "@/app/_components/container";
import { BlogPostList } from "@/app/_components/blog-post-list";

export default async function Index() {
  return (
    <main>
      <Container>
        <BlogPostList />
      </Container>
    </main>
  );
}
