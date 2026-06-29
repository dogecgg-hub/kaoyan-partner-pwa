import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'

export const Card = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={clsx('rounded-card border border-line bg-white p-4 shadow-card', className)}
    {...props}
  />
)

export const Button = ({
  className,
  variant = 'primary',
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) => (
  <button
    className={clsx(
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold transition active:scale-[0.98]',
      variant === 'primary' && 'bg-primary text-white shadow-sm shadow-blue-200',
      variant === 'secondary' && 'border border-line bg-white text-ink',
      variant === 'ghost' && 'bg-transparent text-muted',
      variant === 'danger' && 'bg-red-50 text-danger',
      className,
    )}
    {...props}
  />
)

export const Field = ({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) => (
  <label className={clsx('grid gap-2 text-sm font-medium text-ink', className)}>
    <span>{label}</span>
    {children}
  </label>
)

export const inputClass =
  'min-h-11 w-full rounded-card border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100'

export const Textarea = (props: ComponentProps<'textarea'>) => (
  <textarea className={clsx(inputClass, 'min-h-24 resize-none py-3', props.className)} {...props} />
)

export const Badge = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-md border border-line bg-slate-50 px-2 py-1 text-xs font-medium text-muted',
      className,
    )}
    {...props}
  />
)

export const Empty = ({ children }: { children: ReactNode }) => (
  <div className="rounded-card border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-muted">
    {children}
  </div>
)
