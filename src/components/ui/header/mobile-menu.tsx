import MobileNavigation from './mobile-navigation'
import type { NavItem } from './nav-list'

export interface MobileMenuProps {
  navItems: NavItem[]
  activeDropdown: number | null
  toggleDropdown: (index: number) => void
  isActive: (href: string) => boolean
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  ctaButton?: {
    label: string
    onClick?: () => void
    href?: string
  }
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function MobileMenu({
  navItems,
  activeDropdown,
  toggleDropdown,
  isActive,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  ctaButton,
  LinkComponent,
  onNavigate
}: MobileMenuProps) {
  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className={`flex flex-col gap-1 bg-transparent border-none cursor-pointer p-2 z-[1001] relative w-auto min-w-6 h-6 justify-center items-start md:hidden`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
      >
        <span 
          className={`w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out rounded-sm origin-center relative block flex-shrink-0 ${
            isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''
          }`}
        />
        <span 
          className={`w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out rounded-sm origin-center relative block flex-shrink-0 ${
            isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
          }`}
        />
        <span 
          className={`w-6 h-0.5 bg-black dark:bg-white transition-all duration-300 ease-in-out rounded-sm origin-center relative block flex-shrink-0 ${
            isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Mobile Navigation Panel */}
      <MobileNavigation
        navItems={navItems}
        activeDropdown={activeDropdown}
        toggleDropdown={toggleDropdown}
        isActive={isActive}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        ctaButton={ctaButton}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />
    </>
  )
}
