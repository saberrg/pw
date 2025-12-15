export interface BrandProps {
  logo?: string | React.ReactNode
  siteName?: string
  subtitle?: string
  logoHref?: string
  LinkComponent?: React.ComponentType<any>
  onNavigate?: (href: string) => void
}

export default function Brand({
  logo,
  siteName = 'Your Site',
  subtitle,
  logoHref = '/',
  LinkComponent,
  onNavigate
}: BrandProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate && !LinkComponent) {
      e.preventDefault()
      onNavigate(logoHref)
    }
  }

  const linkProps = {
    href: logoHref,
    className: "flex items-center gap-3 no-underline text-inherit transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded",
    'aria-label': `${siteName} - Home`,
    onClick: handleClick
  }

  const content = (
    <>
      {typeof logo === 'string' ? (
        <img 
          src={logo} 
          alt={siteName} 
          className="h-10 w-auto object-contain"
        />
      ) : (
        <div className="flex items-center">{logo}</div>
      )}
      {siteName && (
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-foreground">
            {siteName}
          </span>
          {subtitle && (
            <span className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="flex-shrink-0">
      {LinkComponent ? (
        <LinkComponent {...linkProps}>
          {content}
        </LinkComponent>
      ) : (
        <a {...linkProps}>
          {content}
        </a>
      )}
    </div>
  )
}
