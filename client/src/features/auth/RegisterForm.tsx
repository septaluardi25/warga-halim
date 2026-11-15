import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { registerSchema, type RegisterFormValues } from './authSchema'
import { useRegisterMutation } from './useAuth'

function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null)
    try {
      const result = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      toast.success(result.message)
      navigate('/login', {
        replace: true,
        state: { registeredMessage: result.message },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pendaftaran akun gagal'
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-scarlet/40 bg-scarlet/10 px-3.5 py-2.5 text-sm font-medium text-scarlet"
        >
          {submitError}
        </div>
      )}

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="Minimal 6 karakter"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="nama@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordInput
        label="Password"
        placeholder="Minimal 8 karakter"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <PasswordInput
        label="Ulangi Password"
        placeholder="Masukkan ulang password Anda"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Mendaftarkan...">
        Daftar Akun
      </Button>
    </form>
  )
}

export default RegisterForm
