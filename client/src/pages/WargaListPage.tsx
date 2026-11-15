import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useWargaListQuery } from '../features/warga/useWarga'
import WargaCard from '../features/warga/WargaCard'

function WargaListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useWargaListQuery(search)
  const wargaList = data?.warga ?? []

  return (
    <div className="space-y-6">
      <Card padding="md" className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-primary">Member Directory</h1>
          <p className="mt-1 text-sm text-muted">
            Search for former colleagues by name to view their profile, current city, and memories.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Search Member Name"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type full name..."
            containerClassName="flex-1"
          />
          {search.trim() !== '' && (
            <Button variant="secondary" onClick={() => setSearch('')}>
              Reset Search
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <Spinner label="Loading member directory..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Failed to load member directory"
          description={error instanceof Error ? error.message : 'An error occurred while loading data.'}
          actionLabel="Try Again"
          onAction={() => void refetch()}
        />
      ) : wargaList.length === 0 ? (
        <EmptyState
          title="No members found"
          description={
            search.trim()
              ? `No member profile matches "${search.trim()}".`
              : 'No member profiles have been added yet.'
          }
          actionLabel={search.trim() ? 'Show All Members' : undefined}
          onAction={search.trim() ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {wargaList.map((warga) => (
            <WargaCard key={warga.id} warga={warga} />
          ))}
        </div>
      )}
    </div>
  )
}

export default WargaListPage
