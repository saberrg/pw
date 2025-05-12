import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  link?: string;
  content: string;
}

// This would typically come from a database or CMS
const projects: Project[] = [
  {
    title: "Personal Website",
    description: "A modern personal website built with Next.js and Tailwind CSS.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/yourusername/blog-starter-kit",
    content: "Detailed description of the project and its features..."
  },
  // Add more projects here
];

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = projects.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === params.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | Projects`,
    description: project.description,
  };
}

export default function ProjectPage({ params }: Props) {
  const project = projects.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/projects" 
        className="text-blue-600 dark:text-blue-400 hover:underline mb-8 inline-block"
      >
        ← Back to Projects
      </Link>
      
      <article className="mt-8">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-4 mb-8">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Live Demo
            </a>
          )}
        </div>

        <div className="prose dark:prose-invert max-w-none">
          {project.content}
        </div>
      </article>
    </div>
  );
} 