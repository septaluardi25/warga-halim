type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  label?: string
  fullPage?: boolean
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

function Spinner({
  size = 'md',
  label = 'Memuat...',
  fullPage = false,
  className = '',
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex flex-col items-center justify-center gap-3 py-8 text-center',
        fullPage ? 'min-h-[40vh]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        aria-hidden="true"
        className={[
          'animate-spin rounded-full border-sky-light border-t-sky-primary',
          sizeClasses[size],
        ].join(' ')}
      />
      {label && <p className="text-sm font-medium text-muted">{label}</p>}
    </div>
  )
}

export default Spinner
