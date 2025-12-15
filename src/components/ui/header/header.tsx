import { useState, useEffect, useRef } from 'react'
import Brand from './brand'
import NavList from './nav-list'
import type { NavItem } from './nav-list'
import MobileMenu from './mobile-menu'
import CTAButton from './cta-button'
import UserMenu from './user-menu'

export type { NavItem }

export interface HeaderProps {
  // Brand identity
  logo?: string | React.ReactNode
  siteName?: string
  subtitle?: string
  logoHref?: string

  // Navigation
  navItems?: NavItem[]
  
  // User actions
  ctaButton?: {
    label: string
    onClick?: () => void
    href?: string
  }
  userMenu?: React.ReactNode

  // Behavior
  sticky?: boolean
  fixed?: boolean
  currentPath?: string
  
  // Customization
  className?: string
  theme?: 'light' | 'dark'
  
  // Framework compatibility
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function Header({
  logo,
  siteName = 'Your Site',
  subtitle,
  logoHref = '/',
  navItems = [],
  ctaButton,
  userMenu,
  sticky = true,
  fixed = false,
  currentPath,
  className = '',
  theme = 'light',
  LinkComponent,
  onNavigate
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns and mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Toggle dropdown
  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  // Check if nav item is active
  const isActive = (href: string) => {
    if (!currentPath) return false
    if (href === '/') return currentPath === '/'
    return currentPath === href || currentPath.startsWith(href + '/')
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const headerClasses = [
    'relative w-full bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-100 z-[1000] transition-all duration-300 box-border m-0 p-0 border-b border-gray-200 dark:border-zinc-800 mb-8',
    sticky && 'sticky top-0',
    fixed && 'fixed top-0 left-0 right-0',
    theme === 'dark' && 'dark',
    isMobileMenuOpen && 'mobile-open',
    className
  ].filter(Boolean).join(' ')

  return (
    <header 
      ref={headerRef}
      className={headerClasses}
      role="banner"
    >
      <div className="m-0 px-[clamp(0.5rem,2vw,1rem)] flex items-center justify-between h-16 gap-8 w-full box-border">
        {/* Brand/Logo */}
        <Brand 
          logo={logo}
          siteName={siteName}
          subtitle={subtitle}
          logoHref={logoHref}
          LinkComponent={LinkComponent}
          onNavigate={onNavigate}
        />

        {/* Desktop Navigation */}
        <NavList
          navItems={navItems}
          activeDropdown={activeDropdown}
          toggleDropdown={toggleDropdown}
          isActive={isActive}
          handleKeyDown={handleKeyDown}
          LinkComponent={LinkComponent}
          onNavigate={onNavigate}
        />

        {/* Right side actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          
          {/* User Menu */}
          {userMenu && (
            <UserMenu>
              {userMenu}
            </UserMenu>
          )}

          {/* CTA Button */}
          {ctaButton && (
            <CTAButton
              label={ctaButton.label}
              onClick={ctaButton.onClick}
              href={ctaButton.href}
              LinkComponent={LinkComponent}
              onNavigate={onNavigate}
            />
          )}

          {/* Mobile Menu (Toggle + Navigation Panel) */}
          <MobileMenu
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
        </div>
      </div>
    </header>
  )
}
