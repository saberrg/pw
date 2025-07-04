'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from "@/interfaces/post";
import { PostList } from "@/app/_components/post-list";

interface DirectoryClientProps {
  allPosts: Post[];
  tagsWithCount: { tag: string; count: number }[];
  initialSelectedTag: string | null;
}

export function DirectoryClient({ 
  allPosts, 
  tagsWithCount, 
  initialSelectedTag 
}: DirectoryClientProps) {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialSelectedTag);
  const router = useRouter();

  useEffect(() => {
    if (initialSelectedTag) {
      const filtered = allPosts.filter(post => post.tags?.includes(initialSelectedTag));
      setFilteredPosts(filtered);
      setSelectedTag(initialSelectedTag);
    } else {
      setFilteredPosts([]);
      setSelectedTag(null);
    }
  }, [initialSelectedTag, allPosts]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // If clicking the same tag, clear filter
      setSelectedTag(null);
      setFilteredPosts([]);
      router.push('/directory');
    } else {
      // Filter by new tag
      setSelectedTag(tag);
      const filtered = allPosts.filter(post => post.tags?.includes(tag));
      setFilteredPosts(filtered);
      router.push(`/directory?tag=${encodeURIComponent(tag)}`);
    }
  };

  const clearFilter = () => {
    setSelectedTag(null);
    setFilteredPosts([]);
    router.push('/directory');
  };

  return (
    <div className="container mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Post Directory</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Browse posts by tags. Click on any tag to filter posts.
        </p>
      </div>

      {/* Tags Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Tags 
          {selectedTag && (
            <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
              (filtered by: {selectedTag})
            </span>
          )}
        </h2>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {tagsWithCount.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            >
              {tag} ({count})
            </button>
          ))}
        </div>

        {selectedTag && (
          <button
            onClick={clearFilter}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Posts Section */}
      <div>
        {selectedTag ? (
          <>
            <PostList 
              posts={filteredPosts} 
              title={`Posts tagged "${selectedTag}" (${filteredPosts.length})`}
            />
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No posts found with tag "{selectedTag}".
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Select a Tag to View Posts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click on any tag above to see posts related to that topic.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 