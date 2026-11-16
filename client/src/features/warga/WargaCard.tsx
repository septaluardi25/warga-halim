import { Link } from 'react-router-dom'
import type { WargaListItem } from '../../types'

interface WargaCardProps {
  warga: WargaListItem
}

function WargaCard({ warga }: WargaCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sky-border bg-white shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-sky-soft">
        {warga.card_photo_url ? (
          <img
            src={warga.card_photo_url}
            alt={warga.full_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm font-medium text-muted">
            <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Foto belum tersedia</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-sky-primary shadow-xs backdrop-blur-xs">
          <svg className="h-3.5 w-3.5 text-sky-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Alumni Halim</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-ink transition-colors group-hover:text-sky-primary">
              {warga.full_name}
            </h2>
          </div>

          <p className="text-sm font-semibold text-sky-primary">
            {warga.position}
          </p>

          {warga.domicile && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{warga.domicile}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3">
          <Link
            to={`/members/${warga.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-sky-dark active:scale-[0.98]"
          >
            <span>Lihat Biodata</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default WargaCard
