import { Metadata } from 'next';
import { ProjectList } from '../_components/project-list';

export const metadata: Metadata = {
  title: 'Projects | In God We Trust',
  description: 'Explore my portfolio of projects and technical work.',
};

const projects = [
  {
    title: "Personal Website",
    description: "A modern personal website built with Next.js and Tailwind CSS.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/yourusername/blog-starter-kit"
  },
  // Add more projects here
];

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <ProjectList projects={projects} />
    </div>
  );
} 