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
    <main className="container mx-auto px-5">
      <ProjectList projects={projects} title="Projects" />
    </main>
  );
} 