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
      toast.success(hadVideo ? 'Home video replaced successfully.' : 'Home video added successfully.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save video.')
    }
  }

  const handleDelete = async () => {
    if (!video) return
    try {
      await deleteVideoMutation.mutateAsync(video.id)
      setConfirmDelete(false)
      reset({ title: '', youtube_url: '' })
      toast.success('Home video deleted successfully.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete video.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link to="/admin" className="inline-flex text-sm font-semibold text-sky-primary hover:text-sky-dark">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Manage Featured Video</h1>
        <p className="text-sm text-muted">
          Only one YouTube video is active on the Home page. Saving a new video replaces the current one.
        </p>
      </div>

      <AdminNav />

      {isLoading ? (
        <Spinner label="Loading video data..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Failed to load video data"
          description={error instanceof Error ? error.message : 'An error occurred while loading video data.'}
          actionLabel="Try Again"
          onAction={() => void refetch()}
        />
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">Current Video</h2>
              {video && (
                <div className="flex flex-wrap items-center gap-2">
                  <ConfirmDeleteActions
                    isConfirming={confirmDelete}
                    label="Delete Video"
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
                title="No featured video yet"
                description="There is currently no active video on the Home page. Use the form below to attach one."
              />
            )}
          </div>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <h2 className="text-lg font-bold text-ink">{video ? 'Replace Home Video' : 'Add Home Video'}</h2>
              <Input label="Video Title *" placeholder="Example: Warga Halim Journey Documentary" error={errors.title?.message} {...register('title')} />
              <Input
                label="YouTube Link *"
                placeholder="Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                helperText="Supports youtube.com/watch?v=..., youtu.be/..., or youtube.com/embed/..."
                error={errors.youtube_url?.message}
                {...register('youtube_url')}
              />
              <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting} loadingText="Saving...">
                  {video ? 'Save & Replace Video' : 'Save Video'}
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
