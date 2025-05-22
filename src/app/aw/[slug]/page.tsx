import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AWItem {
  title: string;
  description: string;
  type: 'audio' | 'writing';
  link?: string;
  content?: string;
}

function getIcon(type: 'audio' | 'writing'): ReactNode {
  if (type === 'audio') {
    return (
      <span className="mr-2 text-blue-500" title="Audio" aria-label="Audio">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4l4 4V3l-4 4z"/></svg>
      </span>
    );
  }
  return (
    <span className="mr-2 text-green-500" title="Writing" aria-label="Writing">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M17 6.41V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h6.59A2 2 0 0 1 13 1.59l4.41 4.41A2 2 0 0 1 17 6.41zM13 3.5V7a1 1 0 0 0 1 1h3.5L13 3.5z"/></svg>
    </span>
  );
}

// This would typically come from a database or CMS
const awItems: AWItem[] = [
  {
    title: 'My First Podcast',
    description: 'A deep dive into modern web development.',
    type: 'audio',
    link: '#',
    content: 'This is a detailed description of the podcast episode, including topics covered, guests, and more.'
  },
  {
    title: 'Reflections on Learning',
    description: 'An essay about the journey of self-education.',
    type: 'writing',
    link: '#',
    content: 'This is the full text or excerpt of the essay, sharing insights and personal experiences.'
  },
  // Add more items here
];

type Props = {
  params: { slug: string };
};

export default async function AWDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const item = awItems.find(
    (i) => i.title.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!item) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/aw"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block"
      >
        ← Back to Audio & Writing
      </Link>
      <article className="mt-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center">
          {getIcon(item.type)}
          {item.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {item.description}
        </p>
        {item.link && (
          <div className="mb-8">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Listen / Read
            </a>
          </div>
        )}
        <div className="prose dark:prose-invert max-w-none">
          {item.content}
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const item = awItems.find(
    (i) => i.title.toLowerCase().replace(/\s+/g, '-') === slug
  );

  if (!item) {
    return notFound();
  }

  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
    },
  };
}

export async function generateStaticParams() {
  return awItems.map((item) => ({
    slug: item.title.toLowerCase().replace(/\s+/g, '-')
  }));
}
