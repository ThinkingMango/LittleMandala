import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary'

export function toolButtonClass(variant: Variant = 'secondary', className?: string) {
  return cn(
    'tactile flex size-16 shrink-0 items-center justify-center rounded-full outline-none md:size-18',
    'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none',
    '[&_svg]:size-8 [&_svg]:shrink-0',
    variant === 'primary'
      ? 'bg-primary text-primary-foreground [--tactile-edge:color-mix(in_oklch,var(--primary)_60%,var(--ink))]'
      : 'bg-secondary text-foreground [--tactile-edge:var(--border)]',
    className,
  )
}

type ToolButtonProps = Omit<ComponentProps<'button'>, 'aria-label' | 'children'> & {
  label: string
  icon: ReactNode
  variant?: Variant
}

export function ToolButton({ label, icon, variant, className, ...props }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={toolButtonClass(variant, className)}
      {...props}
    >
      {icon}
    </button>
  )
}

type ToolLinkProps = {
  href: string
  label: string
  icon: ReactNode
  variant?: Variant
  className?: string
}

export function ToolLink({ href, label, icon, variant, className }: ToolLinkProps) {
  return (
    <Link href={href} aria-label={label} title={label} className={toolButtonClass(variant, className)}>
      {icon}
    </Link>
  )
}
