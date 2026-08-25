import * as React from 'react'
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type TargetAndTransition,
  useReducedMotion,
} from 'motion/react'

export type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown'
export type AutoTransitionElement = 'div' | 'span' | 'section'

const DEFAULT_EASE = [0.22, 1, 0.36, 1] as const
type TransitionPhase = 'initial' | 'animate' | 'exit'
type TransitionVariants = Partial<Record<TransitionPhase, TargetAndTransition>>
type ControlledMotionProp = 'animate' | 'children' | 'className' | 'exit' | 'initial' | 'ref' | 'transition' | 'variants'

type AutoTransitionOwnProps<Element extends AutoTransitionElement> = {
  children: React.ReactNode
  as?: Element
  className?: string
  duration?: number
  type?: TransitionType
  initial?: boolean
  transitionKey?: string | number
  presenceMode?: 'sync' | 'wait' | 'popLayout'
  customVariants?: TransitionVariants
}

type ForwardedMotionProps<Element extends AutoTransitionElement> = Omit<HTMLMotionProps<Element>, ControlledMotionProp | keyof AutoTransitionOwnProps<Element>>
export type AutoTransitionProps<Element extends AutoTransitionElement = 'div'> = AutoTransitionOwnProps<Element> & ForwardedMotionProps<Element>

const transitionVariants: Record<TransitionType, Record<TransitionPhase, TargetAndTransition>> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slide: { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 12 } },
  scale: { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 } },
  slideUp: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } },
  slideDown: { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } },
}

const reducedMotionVariants: Record<TransitionPhase, TargetAndTransition> = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
}

function resolveTransitionKey(children: React.ReactNode, transitionKey?: string | number) {
  if (transitionKey !== undefined) return String(transitionKey)
  const childArray = React.Children.toArray(children)
  if (childArray.length === 0) return 'empty'
  const firstChild = childArray[0]
  if (React.isValidElement(firstChild) && firstChild.key !== null) return String(firstChild.key)
  if (typeof firstChild === 'string' || typeof firstChild === 'number') return String(firstChild)
  return 'node'
}

export function AutoTransition<Element extends AutoTransitionElement = 'div'>({
  children,
  as,
  className = '',
  duration = 0.22,
  type = 'fade',
  initial = true,
  transitionKey,
  presenceMode = 'wait',
  customVariants,
  ...motionProps
}: AutoTransitionProps<Element>) {
  const prefersReducedMotion = useReducedMotion() === true
  const key = resolveTransitionKey(children, transitionKey)
  const variants = prefersReducedMotion
    ? reducedMotionVariants
    : customVariants ? { ...transitionVariants[type], ...customVariants } : transitionVariants[type]
  const sharedProps = {
    className,
    variants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    transition: { duration: prefersReducedMotion ? 0 : duration, ease: DEFAULT_EASE },
  }
  const element = as ?? 'div'
  const motionChild = element === 'span'
    ? <motion.span key={key} {...(motionProps as ForwardedMotionProps<'span'>)} {...sharedProps}>{children}</motion.span>
    : element === 'section'
      ? <motion.section key={key} {...(motionProps as ForwardedMotionProps<'section'>)} {...sharedProps}>{children}</motion.section>
      : <motion.div key={key} {...(motionProps as ForwardedMotionProps<'div'>)} {...sharedProps}>{children}</motion.div>

  return <AnimatePresence mode={presenceMode} initial={initial && !prefersReducedMotion}>{motionChild}</AnimatePresence>
}
