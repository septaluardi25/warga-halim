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
  label = 'Delete',
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: ConfirmDeleteActionsProps) {
  if (isConfirming) {
    return (
      <>
        <Button type="button" variant="danger" size="sm" onClick={onConfirmDelete}>
          Confirm Delete
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancelDelete}>
          Cancel
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
