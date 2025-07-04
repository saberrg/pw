import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getPostsByTag(tag: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.tags?.includes(tag));
}

export function getAWPosts(): Post[] {
  return getPostsByTag('aw');
}

export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const allTags = allPosts
    .flatMap(post => post.tags || [])
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
    .sort(); // Sort alphabetically
  
  return allTags;
}

export function getTagWithPostCount(): { tag: string; count: number }[] {
  const allPosts = getAllPosts();
  const tagCounts: { [key: string]: number } = {};
  
  allPosts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
