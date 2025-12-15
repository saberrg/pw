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
  onNavigate
}: NavItemProps) {
  const isMobile = variant === 'mobile'
  const isActiveLink = isActive(item.href)
  const isDropdownOpen = activeDropdown === index

  if (item.children) {
    const buttonClass = isMobile
      ? `flex items-center justify-between w-full px-4 py-3.5 no-underline text-base font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit text-left ${
          isActiveLink 
            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`
      : `flex items-center gap-2 px-4 py-2 no-underline text-[0.9375rem] font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit ${
          isActiveLink 
            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
    
    return (
      <li className={isMobile ? 'w-full' : 'relative'}>
        <button
          className={buttonClass}
          onClick={() => toggleDropdown(index)}
          onKeyDown={handleKeyDown ? (e) => handleKeyDown(e, () => toggleDropdown(index)) : undefined}
          aria-expanded={!isMobile ? isDropdownOpen : undefined}
          aria-haspopup={!isMobile ? "true" : undefined}
        >
          {item.label}
          <span 
            className={`text-[0.625rem] transition-transform duration-200 ${isMobile ? 'text-xs' : ''} ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>
        <ul 
          className={
            isMobile
              ? `max-h-0 overflow-hidden list-none m-0 p-0 transition-[max-height] duration-300 ease-in-out ${
                  isDropdownOpen ? 'max-h-[500px] py-2 pl-4' : ''
                }`
              : `absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg list-none p-2 min-w-[12rem] z-[100] transition-all duration-200 ${
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
              ? `block px-4 py-3 no-underline text-[0.9375rem] rounded-md transition-all duration-200 opacity-80 ${
                  isChildActive
                    ? 'text-blue-500 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              : `block px-3 py-2.5 no-underline text-[0.9375rem] rounded-md transition-all duration-200 ${
                  isChildActive
                    ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

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
    ? `flex items-center justify-between w-full px-4 py-3.5 no-underline text-base font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit text-left ${
        isActiveLink 
          ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
    : `flex items-center gap-2 px-4 py-2 no-underline text-[0.9375rem] font-medium rounded-md transition-all duration-200 bg-transparent border-none cursor-pointer font-inherit ${
        isActiveLink 
          ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

  const linkProps = {
    href: item.href,
    className: linkClass,
    onClick: handleClick
  }

  return (
    <li className={isMobile ? 'w-full' : 'relative'}>
      {LinkComponent ? (
        <LinkComponent {...linkProps}>
          {item.label}
        </LinkComponent>
      ) : (
        <a {...linkProps}>
          {item.label}
        </a>
      )}
    </li>
  )
}
