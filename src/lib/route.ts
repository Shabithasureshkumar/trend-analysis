import { useCallback, useSyncExternalStore } from 'react'

export const slugify = (label: string) => label.toLowerCase().replace(/\s+/g, '-')

const read = () => window.location.hash.replace(/^#\/?/, '')

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Minimal hash router: returns the current slug (e.g. "daily-log") and a navigate function. */
export function useHashRoute(): [string, (slug: string) => void] {
  const slug = useSyncExternalStore(subscribe, read, () => '')
  const navigate = useCallback((next: string) => {
    window.location.hash = `/${next}`
  }, [])
  return [slug, navigate]
}
