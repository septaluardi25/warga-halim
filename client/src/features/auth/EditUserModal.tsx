import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import type { AdminUserRow } from '../../types'
import {
  updateAdminUserSchema,
  type UpdateAdminUserFormValues,
} from './authSchema'
import { useUpdateAdminUserMutation } from './useAuth'

interface EditUserModalProps {
  user: AdminUserRow | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Komponen modal dialog untuk mengubah data nama akun pengguna di panel admin.
 * Username dan password bersifat tetap dan tidak dapat diedit melalui antarmuka ini.
 *
 * @param props.user - Objek data akun pengguna yang hendak diedit
 * @param props.isOpen - Status visibilitas modal dialog
 * @param props.onClose - Fungsi callback penutupan modal dialog
 */
function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const updateMutation = useUpdateAdminUserMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  })

  // Sinkronisasi nilai form saat user target berubah
  useEffect(() => {
    if (user) {
      reset({ name: user.name })
    }
  }, [user, reset])

  // Penguncian scroll latar belakang dan shortcut Escape
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const onSubmit = useCallback(
    async (values: UpdateAdminUserFormValues) => {
      if (!user) return

      try {
        await updateMutation.mutateAsync({
          id: user.id,
          input: { name: values.name },
        })
        toast.success(`Akun "${values.name}" berhasil diperbarui.`)
        onClose()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Gagal memperbarui akun pengguna.',
        )
      }
    },
    [user, updateMutation, onClose],
  )

  if (!isOpen || !user) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-sky-border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-border pb-4">
          <div>
            <h2 id="edit-user-title" className="text-xl font-bold text-ink">
              Ubah Data Pengguna
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Ubah data profil anggota terdaftar dalam sistem.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela ubah pengguna"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-sky-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-sky-primary"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* Kolom Nama Lengkap (Dapat Diedit) */}
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap (min 6 karakter)"
            autoFocus
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Kolom Username (Tidak Dapat Diedit) */}
          <Input
            label="Username"
            value={user.username}
            disabled
            helperText="Username bersifat unik & permanen, tidak dapat diubah."
          />

          {/* Keterangan Password (Tidak Dapat Diedit) */}
          <div className="rounded-xl border border-sky-border bg-sky-soft/60 p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-sky-primary" aria-hidden="true">
                🔒
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-sky-dark">
                  Password Tidak Dapat Diubah
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Password akun pengguna dienkripsi secara aman dan tidak dapat diedit
                  oleh administrator demi menjaga privasi dan keamanan akun warga.
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-sky-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingText="Menyimpan..."
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal
