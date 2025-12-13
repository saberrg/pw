import { Post } from "@/interfaces/post";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

// Collection name in Firestore
const POSTS_COLLECTION = "posts";

// Helper to convert Firestore document to Post
function docToPost(docId: string, data: any): Post {
  return {
    slug: docId,
    title: data.title || "",
    date: data.date instanceof Timestamp 
      ? data.date.toDate().toISOString() 
      : data.date || "",
    coverImage: data.coverImage || "",
    author: data.author || { name: "", picture: "" },
    excerpt: data.excerpt || "",
    ogImage: data.ogImage || { url: "" },
    content: data.content || "",
    preview: data.preview || false,
    tags: data.tags || [],
    category: data.category || "",
  };
}

export async function getPostSlugs(): Promise<string[]> {
  const postsRef = collection(db, POSTS_COLLECTION);
  const snapshot = await getDocs(postsRef);
  return snapshot.docs.map((doc) => doc.id);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const docRef = doc(db, POSTS_COLLECTION, slug);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToPost(docSnap.id, docSnap.data());
}

export async function getAllPosts(): Promise<Post[]> {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => docToPost(doc.id, doc.data()));
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(
    postsRef,
    where("tags", "array-contains", tag),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => docToPost(doc.id, doc.data()));
}

export async function getAWPosts(): Promise<Post[]> {
  return getPostsByTag("aw");
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const allTags = allPosts
    .flatMap((post) => post.tags || [])
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
    .sort(); // Sort alphabetically

  return allTags;
}

export async function getTagWithPostCount(): Promise<
  { tag: string; count: number }[]
> {
  const allPosts = await getAllPosts();
  const tagCounts: { [key: string]: number } = {};

  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
