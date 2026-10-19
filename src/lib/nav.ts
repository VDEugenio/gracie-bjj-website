/** Primary navigation. "Sign up" is appended by the header and menu as an external Gymdesk link. */
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'New to BJJ?', href: '/new-here' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Programs', href: '/programs' },
  { label: 'Coaches', href: '/coaches' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Home matches exactly; other sections match their sub-pages too (/programs/fundamentals marks Programs). */
export function isCurrent(href: string, currentPath: string): boolean {
  const path = currentPath.replace(/\/+$/, '') || '/';
  if (href === '/') return path === '/';
  return path === href || path.startsWith(href + '/');
}
