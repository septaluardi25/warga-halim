import { Link } from 'react-router-dom'

function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 px-4 py-12 text-white sm:px-8 sm:py-16">
      <img
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/70 to-sky-900/55"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-xs sm:text-6xl">
            Memories that
            <br />
            fly further.
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
            Alumni directory and shared archive for former Halim colleagues. Reconnect across cities
            and cherish our journey together.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-primary shadow-sm">
              Halim Alumni Network · Shared Memories
            </span>
            <Link
              to="/gallery"
              className="inline-flex items-center rounded-full bg-scarlet px-3.5 py-1 text-xs font-bold text-white shadow-sm transition-colors hover:bg-scarlet-hover"
            >
              View Photo Gallery →
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center rounded-full bg-sky-primary px-3.5 py-1 text-xs font-bold text-white shadow-sm transition-colors hover:bg-sky-dark"
            >
              Explore Directory →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeHero
