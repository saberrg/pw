import { getAllPosts, getTagWithPostCount } from "@/lib/api";
import { DirectoryClient } from "./_components/directory-client";

export default function DirectoryPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const allPosts = getAllPosts();
  const tagsWithCount = getTagWithPostCount();
  const selectedTag = searchParams.tag || null;

  return (
    <DirectoryClient 
      allPosts={allPosts}
      tagsWithCount={tagsWithCount}
      initialSelectedTag={selectedTag}
    />
  );
}