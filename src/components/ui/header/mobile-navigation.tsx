import NavItem from './nav-item'
import CTAButton from './cta-button'
import type { NavItem as NavItemType } from './nav-list'

export interface MobileNavigationProps {
  navItems: NavItemType[]
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
  userMenu?: React.ReactNode
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function MobileNavigation({
  navItems,
  activeDropdown,
  toggleDropdown,
  isActive,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  ctaButton,
  userMenu,
  LinkComponent,
  onNavigate
}: MobileNavigationProps) {
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  const handleCTAClick = () => {
    ctaButton?.onClick?.()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[998] md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Navigation Panel */}
      <nav 
        className={`fixed inset-x-0 top-16 bottom-0 z-[999] md:hidden flex flex-col bg-background transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="mobile-nav-list flex flex-col gap-1 list-none m-0 p-0">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                item={item}
                index={index}
                variant="mobile"
                isActive={isActive}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                onLinkClick={handleLinkClick}
                LinkComponent={LinkComponent}
                onNavigate={onNavigate}
                animationDelay={index * 60}
                isMenuOpen={isMobileMenuOpen}
              />
            ))}
            {ctaButton && (
              <li 
                className={`mt-6 ${isMobileMenuOpen ? 'animate-mobile-nav-item' : 'opacity-0'}`}
                style={isMobileMenuOpen ? { animationDelay: `${navItems.length * 60}ms` } : undefined}
              >
                <CTAButton
                  label={ctaButton.label}
                  href={ctaButton.href}
                  onClick={handleCTAClick}
                  LinkComponent={LinkComponent}
                  onNavigate={onNavigate}
                />
              </li>
            )}
          </ul>
        </div>

        {/* User Footer Section */}
        {userMenu && (
          <div 
            className={`border-t border-border px-6 py-5 bg-muted/30 ${isMobileMenuOpen ? 'animate-mobile-nav-item' : 'opacity-0'}`}
            style={isMobileMenuOpen ? { animationDelay: `${(navItems.length + 1) * 60}ms` } : undefined}
          >
            <div className="flex items-center justify-between gap-4">
              {userMenu}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
