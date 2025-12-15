import type { NavItem as NavItemType } from './nav-list'

export interface NavItemProps {
  item: NavItemType
  index: number
  variant: 'desktop' | 'mobile'
  isActive: (href: string) => boolean
  activeDropdown: number | null
  toggleDropdown: (index: number) => void
  handleKeyDown?: (e: React.KeyboardEvent, action: () => void) => void
  onLinkClick?: () => void
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
  animationDelay?: number
  isMenuOpen?: boolean
}

export default function NavItem({
  item,
  index,
  variant,
  isActive,
  activeDropdown,
  toggleDropdown,
  handleKeyDown,
  onLinkClick,
  LinkComponent,
  onNavigate,
  animationDelay = 0,
  isMenuOpen = false
}: NavItemProps) {
  const isMobile = variant === 'mobile'
  const isActiveLink = isActive(item.href)
  const isDropdownOpen = activeDropdown === index

  // Animation classes for mobile nav items - only animate when menu is open
  const mobileAnimationClass = isMobile 
    ? (isMenuOpen ? 'animate-mobile-nav-item' : 'opacity-0')
    : ''

  if (item.children) {
    const buttonClass = isMobile
      ? `group flex items-center justify-between w-full px-2 py-4 no-underline text-2xl font-light tracking-tight rounded-lg transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit text-left ${
          isActiveLink 
            ? 'text-foreground' 
            : 'text-foreground/70 hover:text-foreground active:bg-accent/50'
        }`
      : `flex items-center gap-2 px-4 py-2 no-underline text-[0.9375rem] font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit ${
          isActiveLink 
            ? 'text-foreground bg-accent' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`
    
    return (
      <li 
        className={`${isMobile ? 'w-full' : 'relative'} ${mobileAnimationClass}`}
        style={isMobile && isMenuOpen ? { animationDelay: `${animationDelay}ms` } : undefined}
      >
        <button
          className={buttonClass}
          onClick={() => toggleDropdown(index)}
          onKeyDown={handleKeyDown ? (e) => handleKeyDown(e, () => toggleDropdown(index)) : undefined}
          aria-expanded={!isMobile ? isDropdownOpen : undefined}
          aria-haspopup={!isMobile ? "true" : undefined}
        >
          {item.label}
          <span 
            className={`transition-transform duration-200 ${
              isMobile 
                ? 'text-foreground/40 group-hover:text-foreground/60' 
                : 'text-[0.625rem]'
            } ${isDropdownOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            {isMobile ? (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : '▼'}
          </span>
        </button>
        <ul 
          className={
            isMobile
              ? `overflow-hidden list-none m-0 p-0 transition-all duration-300 ease-out ${
                  isDropdownOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`
              : `absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg shadow-lg list-none p-2 min-w-[12rem] z-[100] transition-all duration-200 ${
                  isDropdownOpen 
                    ? 'opacity-100 visible translate-y-0' 
                    : 'opacity-0 invisible -translate-y-2'
                }`
          }
          role={!isMobile ? "menu" : undefined}
        >
          {item.children.map((child, childIndex) => {
            const handleChildClick = (e: React.MouseEvent) => {
              if (onNavigate && !LinkComponent) {
                e.preventDefault()
                onNavigate(child.href)
              }
              onLinkClick?.()
            }

            const isChildActive = isActive(child.href)
            const childLinkClass = isMobile
              ? `block px-4 py-3 no-underline text-lg font-light rounded-lg transition-all duration-200 ${
                  isChildActive
                    ? 'text-foreground bg-accent/50' 
                    : 'text-foreground/50 hover:text-foreground/80 active:bg-accent/30'
                }`
              : `block px-3 py-2.5 no-underline text-[0.9375rem] rounded-md transition-all duration-200 ${
                  isChildActive
                    ? 'text-foreground bg-accent font-medium' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`

            const childLinkProps = {
              href: child.href,
              className: childLinkClass,
              role: !isMobile ? "menuitem" : undefined,
              onClick: handleChildClick
            }

            return (
              <li key={childIndex} role={!isMobile ? "none" : undefined}>
                {LinkComponent ? (
                  <LinkComponent {...childLinkProps}>
                    {child.label}
                  </LinkComponent>
                ) : (
                  <a {...childLinkProps}>
                    {child.label}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </li>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate && !LinkComponent) {
      e.preventDefault()
      onNavigate(item.href)
    }
    onLinkClick?.()
  }

  const linkClass = isMobile
    ? `group flex items-center justify-between w-full px-2 py-4 no-underline text-2xl font-light tracking-tight rounded-lg transition-all duration-200 ${
        isActiveLink 
          ? 'text-foreground' 
          : 'text-foreground/70 hover:text-foreground active:bg-accent/50'
      }`
    : `flex items-center gap-2 px-4 py-2 no-underline text-[0.9375rem] font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit ${
        isActiveLink 
          ? 'text-foreground bg-accent' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`

  const linkProps = {
    href: item.href,
    className: linkClass,
    onClick: handleClick
  }

  return (
    <li 
      className={`${isMobile ? 'w-full' : 'relative'} ${mobileAnimationClass}`}
      style={isMobile && isMenuOpen ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {LinkComponent ? (
        <LinkComponent {...linkProps}>
          <span>{item.label}</span>
          {isMobile && (
            <svg 
              className="text-foreground/30 group-hover:text-foreground/50 transition-colors"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </LinkComponent>
      ) : (
        <a {...linkProps}>
          <span>{item.label}</span>
          {isMobile && (
            <svg 
              className="text-foreground/30 group-hover:text-foreground/50 transition-colors"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </a>
      )}
    </li>
  )
}
