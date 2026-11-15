import Button from '../../components/ui/Button'

interface ConfirmDeleteActionsProps {
  isConfirming: boolean
  label?: string
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

/** Two-step inline delete confirmation buttons for admin views. */
function ConfirmDeleteActions({
  isConfirming,
  label = 'Hapus',
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: ConfirmDeleteActionsProps) {
  if (isConfirming) {
    return (
      <>
        <Button type="button" variant="danger" size="sm" onClick={onConfirmDelete}>
          Ya, Hapus
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancelDelete}>
          Batal
        </Button>
      </>
    )
  }

  return (
    <Button type="button" variant="danger" size="sm" onClick={onRequestDelete}>
      {label}
    </Button>
  )
}

export default ConfirmDeleteActions
