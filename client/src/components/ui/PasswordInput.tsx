import { useId, useState } from 'react'
import type { ComponentPropsWithRef } from 'react'

export interface PasswordInputProps extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

/**
 * Komponen input kata sandi dengan tombol logo mata untuk beralih antara menampilkan dan menyembunyikan teks password.
 * Dilengkapi atribut `tabIndex={-1}` pada tombol logo mata agar navigasi keyboard tombol Tab
 * berpindah langsung ke elemen input berikutnya tanpa terjeda pada tombol mata.
 *
 * @param props.label - Teks label untuk field kata sandi
 * @param props.error - Pesan galat validasi
 * @param props.helperText - Teks petunjuk pendukung
 * @param props.containerClassName - Kelas Tailwind untuk wrapper kontainer
 */
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
            'w-full rounded-lg border bg-white py-2 pr-11 pl-3.5 text-sm text-ink transition-colors',
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
          tabIndex={-1}
          onClick={() => setIsVisible((prev) => !prev)}
          aria-pressed={isVisible}
          aria-label={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
          title={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 pl-2 text-muted transition-colors hover:text-sky-primary focus:outline-none"
        >
          {isVisible ? (
            /* Ikon Mata Dicoret (Eye Slash) saat password terlihat */
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            /* Ikon Mata Terbuka (Eye) saat password tersembunyi */
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
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
