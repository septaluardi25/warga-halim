import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import FeaturedVideo from '../features/beranda/FeaturedVideo'
import { useDeleteVideoMutation, useHomeQuery, useSaveVideoMutation } from '../features/beranda/useHome'
import AdminNav from '../features/warga/AdminNav'
import ConfirmDeleteActions from '../features/warga/ConfirmDeleteActions'
import { videoFormSchema, type VideoFormValues } from '../features/warga/wargaSchema'

function AdminVideoPage() {
  const { data, isLoading, isError, error, refetch } = useHomeQuery()
  const saveVideoMutation = useSaveVideoMutation()
  const deleteVideoMutation = useDeleteVideoMutation()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const video = data?.video ?? null

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: { title: '', youtube_url: '' },
    values: { title: video?.title ?? '', youtube_url: video?.youtube_url ?? '' },
  })

  const onSubmit = async (values: VideoFormValues) => {
    try {
      const hadVideo = video !== null
      const result = await saveVideoMutation.mutateAsync({ title: values.title, youtube_url: values.youtube_url })
      setConfirmDelete(false)
      reset({ title: result.video.title, youtube_url: result.video.youtube_url })
      toast.success(hadVideo ? 'Video beranda berhasil diperbarui.' : 'Video beranda berhasil ditambahkan.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan video.')
    }
  }

  const handleDelete = async () => {
    if (!video) return
    try {
      await deleteVideoMutation.mutateAsync(video.id)
      setConfirmDelete(false)
      reset({ title: '', youtube_url: '' })
      toast.success('Video beranda berhasil dihapus.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus video.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Kembali ke Kelola Warga
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Kelola Video Beranda</h1>
        <p className="text-sm text-muted">
          Hanya satu video YouTube yang aktif di halaman beranda. Menyimpan video baru akan menggantikan video yang lama.
        </p>
      </div>

      <AdminNav />

      {isLoading ? (
        <Spinner label="Memuat data video..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Gagal memuat data video"
          description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data video.'}
          actionLabel="Coba Lagi"
          onAction={() => void refetch()}
        />
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">Video Saat Ini</h2>
              {video && (
                <div className="flex flex-wrap items-center gap-2">
                  <ConfirmDeleteActions
                    isConfirming={confirmDelete}
                    label="Hapus Video"
                    onRequestDelete={() => setConfirmDelete(true)}
                    onConfirmDelete={() => void handleDelete()}
                    onCancelDelete={() => setConfirmDelete(false)}
                  />
                </div>
              )}
            </div>
            {video ? (
              <FeaturedVideo video={video} />
            ) : (
              <EmptyState
                title="Belum ada video unggulan"
                description="Saat ini belum ada video aktif di halaman beranda. Gunakan formulir di bawah untuk menambahkan video."
              />
            )}
          </div>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <h2 className="text-lg font-bold text-ink">{video ? 'Ganti Video Beranda' : 'Tambah Video Beranda'}</h2>
              <Input label="Judul Video *" placeholder="Contoh: Video Dokumenter Perjalanan Warga Halim" error={errors.title?.message} {...register('title')} />
              <Input
                label="Tautan YouTube *"
                placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                helperText="Mendukung format tautan youtube.com/watch?v=..., youtu.be/..., atau youtube.com/embed/..."
                error={errors.youtube_url?.message}
                {...register('youtube_url')}
              />
              <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting} loadingText="Menyimpan...">
                  {video ? 'Simpan & Ganti Video' : 'Simpan Video'}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </section>
  )
}

export default AdminVideoPage
