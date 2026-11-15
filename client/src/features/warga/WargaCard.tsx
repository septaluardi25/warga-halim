import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import type { WargaListItem } from '../../types'

interface WargaCardProps {
  warga: WargaListItem
}

function WargaCard({ warga }: WargaCardProps) {
  return (
    <Card padding="none" className="flex flex-col overflow-hidden">
      <div className="aspect-4/3 w-full overflow-hidden border-b border-sky-border bg-sky-soft">
        {warga.card_photo_url ? (
          <img
            src={warga.card_photo_url}
            alt={warga.full_name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">
            Photo not available
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">{warga.full_name}</h2>
          <p className="mt-1 text-sm text-muted">City: {warga.city}</p>
        </div>

        <Link
          to={`/members/${warga.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-scarlet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-scarlet-hover"
        >
          View Profile
        </Link>
      </div>
    </Card>
  )
}

export default WargaCard
