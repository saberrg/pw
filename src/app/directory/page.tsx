import { getAllPosts, getTagWithPostCount } from "@/lib/api";
import { DirectoryClient } from "./_components/directory-client";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const allPosts = await getAllPosts();
  const tagsWithCount = await getTagWithPostCount();
  const selectedTag = searchParams.tag || null;

  return (
    <DirectoryClient 
      allPosts={allPosts}
      tagsWithCount={tagsWithCount}
      initialSelectedTag={selectedTag}
    />
  );
}