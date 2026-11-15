import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { useAuthStore } from '../../store/authStore'
import { loginSchema, type LoginFormValues } from './authSchema'
import { useLoginMutation } from './useAuth'

interface LocationState {
  registeredMessage?: string
}

function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const state = location.state as LocationState | null
  const registeredMessage = state?.registeredMessage

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    try {
      const result = await loginMutation.mutateAsync(values)
      setAuth(result.token, result.user)
      toast.success(`Welcome back, ${result.user.name}!`)
      navigate(result.user.role === 'admin' ? '/admin' : '/members', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {registeredMessage && (
        <div role="status" className="rounded-lg border border-sky-border bg-sky-light px-3.5 py-2.5 text-sm font-medium text-sky-dark">
          {registeredMessage}
        </div>
      )}

      {submitError && (
        <div role="alert" className="rounded-lg border border-scarlet/40 bg-scarlet/10 px-3.5 py-2.5 text-sm font-medium text-scarlet">
          {submitError}
        </div>
      )}

      <Input label="Email" type="email" placeholder="name@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />

      <PasswordInput label="Password" placeholder="Minimum 8 characters" autoComplete="current-password" error={errors.password?.message} {...register('password')} />

      <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Signing in...">
        Sign In
      </Button>
    </form>
  )
}

export default LoginForm
