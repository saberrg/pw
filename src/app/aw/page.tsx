import { AWList } from '../_components/aw-list';

interface AWItem {
  title: string;
  description: string;
  type: 'audio' | 'writing';
  link?: string;
}

const awItems: AWItem[] = [
  {
    title: 'My First Podcast',
    description: 'A deep dive into modern web development.',
    type: 'audio',
    link: '/aw/my-first-podcast',
  },
  {
    title: 'Reflections on Learning',
    description: 'An essay about the journey of self-education.',
    type: 'writing',
    link: '/aw/reflections-on-learning',
  },
  // Add more items here
];

export default function AWPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Audio & Writing</h1>
      <AWList items={awItems} />
    </div>
  );
}
