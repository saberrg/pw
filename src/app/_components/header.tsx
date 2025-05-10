import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

const Header = () => {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Site Name and Subtitle */}
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              In God We Trust
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              My Personal Website
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Contact
            </Link>
            <span className="ml-4"><ThemeSwitcher /></span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
