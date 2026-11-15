import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { companyProfile } from '../content/profilPerusahaan'
import AlbumSlideshow from '../features/beranda/AlbumSlideshow'
import FeaturedVideo from '../features/beranda/FeaturedVideo'
import HomeHero from '../features/beranda/HomeHero'
import { useHomeQuery } from '../features/beranda/useHome'

function HomePage() {
  const { data, isLoading, isError, error, refetch } = useHomeQuery()

  return (
    <div className="w-full">
      <div className="w-full border-b border-sky-border bg-white shadow-xs">
        <HomeHero />

        <section className="w-full bg-white px-4 py-10 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-scarlet uppercase">
                Company Profile
              </p>
              <h2 className="text-2xl font-bold text-sky-primary sm:text-3xl">
                {companyProfile.title}
              </h2>
              <p className="text-sm font-medium text-sky-dark sm:text-base">
                {companyProfile.subtitle}
              </p>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink sm:text-base">
              {companyProfile.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/gallery"
                className="w-full rounded-lg bg-scarlet px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-scarlet-hover sm:w-auto"
              >
                Explore Photo Gallery
              </Link>
              <Link
                to="/members"
                className="w-full rounded-lg border border-sky-border bg-sky-soft px-4 py-2 text-center text-sm font-semibold text-sky-dark transition-colors hover:bg-sky-light sm:w-auto"
              >
                View Member Directory
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="w-full px-4 py-8 sm:px-6 sm:py-12">
        <section className="mx-auto w-full space-y-8 rounded-3xl border border-sky-border bg-linear-to-b from-sky-light via-[#e0f2fe] to-sky-soft p-5 shadow-md sm:p-8 md:w-[80%]">
          {isLoading ? (
            <Spinner label="Loading albums and featured video..." />
          ) : isError ? (
            <EmptyState
              variant="error"
              title="Failed to load home content"
              description={
                error instanceof Error ? error.message : 'An error occurred while loading data.'
              }
              actionLabel="Try Again"
              onAction={() => void refetch()}
            />
          ) : (
            data && (
              <>
                <AlbumSlideshow albums={data.albums} />
                <FeaturedVideo video={data.video} />
              </>
            )
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage
