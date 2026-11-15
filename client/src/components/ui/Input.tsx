import { useId } from 'react'
import type { ComponentPropsWithRef } from 'react'

export interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  containerClassName = '',
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const feedbackId = `${inputId}-feedback`
  const hasFeedback = Boolean(error || helperText)

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hasFeedback ? feedbackId : undefined}
        className={[
          'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-ink transition-colors',
          'placeholder:text-muted/70 focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:bg-sky-soft disabled:text-muted',
          error
            ? 'border-scarlet focus:border-scarlet focus:ring-scarlet/20'
            : 'border-sky-border focus:border-sky-primary focus:ring-sky-primary/20',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? (
        <p id={feedbackId} role="alert" className="mt-1 text-xs font-medium text-scarlet">
          {error}
        </p>
      ) : helperText ? (
        <p id={feedbackId} className="mt-1 text-xs text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

export default Input
