export interface UserMenuProps {
  children: React.ReactNode
}

export default function UserMenu({
  children
}: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      {children}
    </div>
  )
}
