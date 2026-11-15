import type { ComponentPropsWithRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-primary text-white hover:bg-sky-dark focus-visible:outline-sky-primary',
  secondary:
    'border border-sky-border bg-sky-soft text-sky-dark hover:bg-sky-light focus-visible:outline-sky-primary',
  outline:
    'border border-sky-primary bg-white text-sky-primary hover:bg-sky-primary hover:text-white focus-visible:outline-sky-primary',
  danger:
    'bg-scarlet text-white hover:bg-scarlet-hover focus-visible:outline-scarlet',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  type = 'button',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading)

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  )
}

export default Button
