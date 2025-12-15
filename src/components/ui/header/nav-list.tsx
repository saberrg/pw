import NavItem from './nav-item'

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface NavListProps {
  navItems: NavItem[]
  activeDropdown: number | null
  toggleDropdown: (index: number) => void
  isActive: (href: string) => boolean
  handleKeyDown: (e: React.KeyboardEvent, action: () => void) => void
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function NavList({
  navItems,
  activeDropdown,
  toggleDropdown,
  isActive,
  handleKeyDown,
  LinkComponent,
  onNavigate
}: NavListProps) {
  return (
    <nav className="hidden md:flex md:flex-1 md:justify-end" aria-label="Main navigation">
      <ul className="flex list-none m-0 p-0 gap-2 items-center">
        {navItems.map((item, index) => (
          <NavItem
            key={index}
            item={item}
            index={index}
            variant="desktop"
            isActive={isActive}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
            handleKeyDown={handleKeyDown}
            LinkComponent={LinkComponent}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}
