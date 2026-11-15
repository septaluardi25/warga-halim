import { useId, useState } from 'react'
import type { ComponentPropsWithRef } from 'react'

export interface PasswordInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

function PasswordInput({
  label,
  error,
  helperText,
  id,
  className = '',
  containerClassName = '',
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
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
      <div className="relative">
        <input
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={hasFeedback ? feedbackId : undefined}
          className={[
            'w-full rounded-lg border bg-white py-2 pr-24 pl-3.5 text-sm text-ink transition-colors',
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
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-pressed={isVisible}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-scarlet transition-colors hover:text-scarlet-hover"
        >
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
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

export default PasswordInput
