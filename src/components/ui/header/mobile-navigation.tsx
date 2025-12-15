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
    <nav 
      className={`absolute top-16 left-0 right-0 w-full box-border border-t transition-[max-height] duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-[calc(100vh-4rem)] overflow-y-auto border-gray-200 dark:border-gray-700' 
          : 'max-h-0 overflow-hidden border-transparent'
      } bg-white dark:bg-gray-800`}
      aria-label="Mobile navigation"
    >
      <ul className="flex flex-col gap-2 list-none m-0 p-4 md:p-6">
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
          />
        ))}
        {ctaButton && (
          <li className="w-full mt-2">
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
    </nav>
  )
}
