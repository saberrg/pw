export interface CTAButtonProps {
  label: string
  onClick?: () => void
  href?: string
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function CTAButton({
  label,
  onClick,
  href,
  LinkComponent,
  onNavigate
}: CTAButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (href && onNavigate && !LinkComponent) {
      e.preventDefault()
      onNavigate(href)
    }
    onClick?.()
  }

  const baseClasses = "px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[0.9375rem] font-medium rounded-md transition-all duration-200 border-none cursor-pointer font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hidden md:block"

  if (href && LinkComponent) {
    return (
      <LinkComponent
        href={href}
        className={baseClasses}
        onClick={onClick}
      >
        {label}
      </LinkComponent>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={baseClasses}
      >
        {label}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
    >
      {label}
    </button>
  )
}
