import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import Dropdown from "./dropdown";

const Header = () => {
  const navigationItems = [
    { label: "Travel", href: "/travel" },
    { label: "Computers", href: "/computers" },
    // { label: "Audios & Writings", href: "/aw" },
    // { label: "Projects", href: "/projects" },
    // { label: "Documentations", href: "/docs" },
  ];

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Site Name and Subtitle */}
          <div className="flex flex-col -ml-20">
            <Link href="/" className="text-2xl font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              My Personal Website
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gloria in Excelsis Deo
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            {/* <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Home
            </Link> */}
            
            {/* <Dropdown label="Navigation" items={navigationItems} /> */}
            {/* <Link href="/aw" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Audios & Writings
            </Link> */}
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Projects
            </Link>
            {/* <Link href="/docs" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Documentations
            </Link> */}
            {/* <Link href="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Contact
            </Link> */}
            <div className="flex-grow"></div>
            <span className="ml-8"><ThemeSwitcher /></span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
