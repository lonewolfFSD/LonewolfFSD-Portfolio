import React, { useState } from 'react';
import { Book, Earth, Github } from 'lucide-react';
import NewsletterForm from './Newsletter';
import Lyra from './mockups/Lyra.jpg';
import LonewolfFSD from './mockups/logo.png';
import { useTranslation } from 'react-i18next';

// Define the Project type for TypeScript
interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  readTime: string;
  github?: string;
}

// Sample project data
const projects: Project[] = [
  {
    title: 'Lyra: Virtual AI Companion',
    description: 'project.lyra.description', // Added for potential future use
    image: Lyra,
    link: 'https://lyralabs.lonewolffsd.in',
    readTime: 'WEBSITE',
    github: 'https://github.com/lonewolfFSD/LyraLabs-AI',
  },
  {
    title: 'LonewolfFSD Portfolio',
    description: 'project.lonewolffsd.description',
    image: LonewolfFSD,
    link: '#',
    readTime: 'WEBSITE',
    github: 'https://github.com/lonewolffsd',
  },
  {
    title: 'Meauli: Pet Accessories ',
    description: 'project.lonewolffsd.description',
    image: 'https://i.ibb.co/jkdY2xg1/Pics-Art-07-30-06-53-07.jpg',
    link: 'https://meauli.vercel.app',
    readTime: 'BLOG',
    github: '',
  },
    
];

// Project Card Component
const ProjectCard: React.FC<{ project: Project; isNewsletter?: boolean }> = ({ project, isNewsletter = false }) => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState<boolean>(false);

  const { t, i18n } = useTranslation();
  // Handle click for newsletter card to open overlay
  const handleNewsletterClick = (e: React.MouseEvent) => {
    if (isNewsletter) {
      e.preventDefault(); // Prevent any link navigation
      setIsNewsletterOpen(true);
    }
  };

  // Conditionally render as div for newsletter or a for projects
  const CardWrapper = isNewsletter ? 'div' : 'a';

  return (
    <>
      <CardWrapper
        {...(isNewsletter
          ? { onClick: handleNewsletterClick, className: 'group relative cursor-custom-pointer flex h-60 lg:h-62 flex-col justify-between overflow-hidden p-6 transition-colors hover:bg-neutral-100 md:h-80 md:p-9' }
          : {
              href: project.link,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'group relative cursor-custom-pointer flex h-60 lg:h-62 flex-col justify-between overflow-hidden p-6 transition-colors hover:bg-neutral-100 md:h-80 md:p-9',
            })}
      >
        <div className="flex flex-col cursor-custom-pointer justify-between h-full">
          <div>
            {!isNewsletter && (
              <div className="flex items-center gap-1.5 text-xs uppercase text-neutral-500 transition-colors duration-500 group-hover:text-black">
                {project.readTime.includes('BLOG') ? (
                  <Book size={18} className="text-base" />
                ) : (
                  <Earth size={18} className="text-base" />
                )}
                <span>{t(project.readTime)}</span>
              </div>
            )}
            {isNewsletter && (
              <div className="flex items-center gap-1.5 text-xs uppercase text-neutral-500 transition-colors duration-500 group-hover:text-neutral-900">
                <Earth size={18} className="text-base" />
                <span>lonewolffsd.in</span>
              </div>
            )}
          </div>
          <h2
            className={`relative z-10 text-3xl leading-tight ${
              isNewsletter ? 'text-4xl uppercase' : 'transition-transform duration-500 group-hover:-translate-y-3'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isNewsletter ? (
              <>
                <span className="text-neutral-500 transition-colors duration-500 group-hover:text-black group-hover:font-bold">
                  {t('JOIN OUR')}
                </span>
                <br />
                {t('WEEKLY NEWSLETTER')}
              </>
            ) : (
              t(project.title)
            )}
          </h2>
        </div>
        {!isNewsletter && (
          <div className="absolute right-8 top-8 z-10 flex space-x-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <Github
                  size={20}
                  className="text-2xl mt-[4px] text-neutral-500 transition-colors duration-500 group-hover:text-neutral-900"
                />
              </a>
            )}
          </div>
        )}
        {!isNewsletter && (
          <div
            className="absolute bottom-0 left-0 right-0 top-0 opacity-0 grayscale transition-all blur-sm group-hover:opacity-30 group-active:scale-105 group-active:opacity-30 group-active:blur-0 group-active:grayscale-0"
            style={{
              backgroundImage: `url(${project.image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
            }}
          />
        )}
        {/* Corner border animations */}
        <span className="absolute left-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute left-[1px] top-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute bottom-[1px] right-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute bottom-[1px] right-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute bottom-[1px] left-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute bottom-[1px] left-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute right-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        <span className="absolute right-[1px] top-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
      </CardWrapper>
      {isNewsletter && (
        <NewsletterForm
          isOpen={isNewsletterOpen}
          onClose={() => setIsNewsletterOpen(false)}
        />
      )}
    </>
  );
};

// Project Showcase Section Component
const ProjectShowcase: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white text-neutral-900 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-neutral-300 border border-neutral-300 lg:grid-cols-3 md:divide-x lg:divide-y-0">
        <ProjectCard
          project={{
            title: 'Weekly Newsletter',
            description: '',
            image: '',
            link: '#',
            readTime: '',
          }}
          isNewsletter
        />
        <ProjectCard project={projects[0]} />
        <ProjectCard project={projects[1]} />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 divide-y divide-neutral-300 border-x border-b border-neutral-300 md:divide-x md:divide-y-0">
        <ProjectCard project={projects[2]} />
        <a
          href="#"
          className="group relative flex h-56 cursor-custom-pointer flex-col justify-end p-6 transition-colors hover:bg-neutral-100 md:h-80 md:p-9"
        >
          <div className="flex flex-col justify-end h-full">
            <h2
              className="relative z-10 text-3xl leading-tight transition-transform duration-500 group-hover:-translate-y-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {t("Upcoming Projects Will Be Available Soon")}
            </h2>
          </div>
          {/* Corner border animations */}
          <span className="absolute left-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute left-[1px] top-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute bottom-[1px] right-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute bottom-[1px] right-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute bottom-[1px] left-[1px] z-10 h-3 w-[1px] origin-bottom scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute bottom-[1px] left-[1px] z-10 h-[1px] w-3 origin-left scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute right-[1px] top-[1px] z-10 h-3 w-[1px] origin-top scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
          <span className="absolute right-[1px] top-[1px] z-10 h-[1px] w-3 origin-right scale-0 bg-black transition-all duration-500 group-hover:scale-100" />
        </a>
      </div>
    </section>
  );
};

export default ProjectShowcase;
