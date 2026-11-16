import { useState } from 'react'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useWargaListQuery } from '../features/warga/useWarga'
import WargaCard from '../features/warga/WargaCard'

/**
 * Halaman daftar biodata warga (/members, alias /warga).
 * Menampilkan bilah pencarian langsung tanpa section header direktori warga,
 * serta menampilkan daftar kartu warga dengan foto kartu utama dan posisi terakhir.
 */
function WargaListPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useWargaListQuery(search)
  const wargaList = data?.warga ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama..."
          aria-label="Cari nama"
          containerClassName="flex-1"
        />
        {search.trim() !== '' && (
          <Button variant="secondary" onClick={() => setSearch('')}>
            Reset Pencarian
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner label="Memuat direktori warga..." />
      ) : isError ? (
        <EmptyState
          variant="error"
          title="Gagal memuat direktori warga"
          description={error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.'}
          actionLabel="Coba Lagi"
          onAction={() => void refetch()}
        />
      ) : wargaList.length === 0 ? (
        <EmptyState
          title="Warga tidak ditemukan"
          description={
            search.trim()
              ? `Tidak ada biodata warga yang cocok dengan "${search.trim()}".`
              : 'Belum ada biodata warga yang ditambahkan.'
          }
          actionLabel={search.trim() ? 'Tampilkan Semua Warga' : undefined}
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
