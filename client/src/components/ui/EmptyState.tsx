import type { ReactNode } from 'react'
import Button from './Button'

type EmptyStateVariant = 'empty' | 'error'

export interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  variant?: EmptyStateVariant
  children?: ReactNode
  className?: string
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
  children,
  className = '',
}: EmptyStateProps) {
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={[
        'rounded-2xl border bg-white p-8 text-center shadow-sm',
        isError ? 'border-scarlet/40' : 'border-sky-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        aria-hidden="true"
        className={[
          'mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold',
          isError ? 'bg-scarlet/10 text-scarlet' : 'bg-sky-light text-sky-primary',
        ].join(' ')}
      >
        {isError ? '!' : 'i'}
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{description}</p>}
      {(actionLabel && onAction) || children ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default EmptyState
