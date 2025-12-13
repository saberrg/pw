import Container from "@/app/_components/container";
import { Intro } from "@/app/_components/intro";
import { PostList } from "@/app/_components/post-list";
import { getAllPosts } from "@/lib/api";

export default async function Index() {
  const allPosts = await getAllPosts();
  //console.log(allPosts);
  return (
    <main>
      <Container>
        {/* <Intro /> */}
        <PostList posts={allPosts} />
      </Container>
    </main>
  );
}
