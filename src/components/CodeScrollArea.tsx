import { useEffect, useRef, type ReactNode } from 'react'
import type { PartialOptions } from 'overlayscrollbars'
import { OverlayScrollbars } from 'overlayscrollbars'

const codeScrollbarOptions = {
  overflow: {
    x: 'scroll',
    y: 'hidden',
  },
  scrollbars: {
    theme: 'os-theme-everyday',
    autoHide: 'move',
    autoHideDelay: 420,
    autoHideSuspend: false,
  },
} satisfies PartialOptions

type CodeScrollAreaProps = {
  children: ReactNode
}

export function CodeScrollArea({ children }: CodeScrollAreaProps) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const instance = OverlayScrollbars(host, codeScrollbarOptions)
    return () => instance.destroy()
  }, [])

  return (
    <div className="settings-code-scroll" ref={hostRef}>
      {children}
    </div>
  )
}
