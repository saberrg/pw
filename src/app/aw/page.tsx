import { AWList } from "@/app/_components/aw-list";
import { getAWPosts } from "@/lib/api";

export default function AWPage() {
  const awPosts = getAWPosts();
  
  return (
    <main className="container mx-auto px-5">
      <AWList items={awPosts} title="Audio & Writing" />
    </main>
  );
}
