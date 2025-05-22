"use client";

import Link from 'next/link';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

interface ProjectListProps {
  projects: Project[];
  title?: string;
}

function getProjectIcon(): React.ReactNode {
  return (
    <span className="mr-2 text-purple-500" title="Project" aria-label="Project">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"/>
      </svg>
    </span>
  );
}

export function ProjectList({ projects, title }: ProjectListProps) {
  return (
    <div className="space-y-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="space-y-6">
        {projects.map((project, index) => {
          const slug = project.title.toLowerCase().replace(/\s+/g, '-');
          
          return (
            <Link
              key={index}
              href={`/projects/${slug}`}
              className="block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                {getProjectIcon()}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 