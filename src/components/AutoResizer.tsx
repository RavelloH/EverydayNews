import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion, type Easing, useReducedMotion } from 'motion/react'

const DEFAULT_EASE: Easing = [0.22, 1, 0.36, 1]

export type AutoResizerProps = {
  children: ReactNode
  className?: string
  duration?: number
  ease?: Easing | Easing[]
  initial?: boolean
  animateWidth?: boolean
  animateHeight?: boolean
}

type MeasuredSize = {
  height: number | 'auto'
  width: number | 'auto'
  shouldAnimate: boolean
}

export function AutoResizer({
  children,
  className = '',
  duration = 0.28,
  ease = DEFAULT_EASE,
  initial = false,
  animateWidth = false,
  animateHeight = true,
}: AutoResizerProps) {
  const prefersReducedMotion = useReducedMotion() === true
  const [size, setSize] = useState<MeasuredSize>(() => ({
    height: initial && animateHeight ? 0 : 'auto',
    width: initial && animateWidth ? 0 : 'auto',
    shouldAnimate: initial,
  }))
  const hasMeasuredRef = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    let active = true
    const measure = () => {
      if (!active) return
      const nextHeight = animateHeight ? content.scrollHeight : 'auto'
      const nextWidth = animateWidth ? content.scrollWidth : 'auto'
      const shouldAnimate = initial || hasMeasuredRef.current
      hasMeasuredRef.current = true
      setSize((current) => current.height === nextHeight && current.width === nextWidth
        ? current
        : { height: nextHeight, width: nextWidth, shouldAnimate })
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(content)
    return () => {
      active = false
      observer?.unobserve(content)
      observer?.disconnect()
    }
  }, [animateHeight, animateWidth, initial])

  const animateTarget: { height?: number | 'auto'; width?: number | 'auto' } = {}
  if (animateHeight) animateTarget.height = size.height
  if (animateWidth) animateTarget.width = size.width

  return (
    <motion.div
      className={className}
      style={{ overflow: 'hidden', display: animateWidth ? 'inline-flex' : undefined }}
      animate={animateTarget}
      transition={{ duration: prefersReducedMotion || !size.shouldAnimate ? 0 : duration, ease }}
    >
      <div ref={contentRef} style={animateWidth ? { display: 'inline-block', width: 'max-content' } : undefined}>
        {children}
      </div>
    </motion.div>
  )
}
