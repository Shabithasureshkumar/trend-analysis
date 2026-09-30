import { useCallback, useRef, useState } from 'react'

/** Returns a callback ref plus the observed content width of the attached element. */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0)
  const observerRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return
    setWidth(Math.round(node.getBoundingClientRect().width))
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(Math.round(entry.contentRect.width))
    })
    observer.observe(node)
    observerRef.current = observer
  }, [])

  return [ref, width] as const
}
