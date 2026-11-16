/**
 * Memformat string tanggal berstandar ISO-8601 menjadi representasi teks tanggal yang mudah dibaca.
 * Jika string tanggal tidak valid atau bernilai kosong, mengembalikan karakter dash `'-'`.
 *
 * @param isoDate - String tanggal berformat ISO (misal: '2026-11-15T15:38:32.000Z')
 * @returns {string} String tanggal yang diformat (contoh: 'Nov 15, 2026')
 */
export function formatDate(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(parsed)
}

/**
 * Memformat string tanggal lahir (format 'YYYY-MM-DD' atau ISO) ke format tanggal Indonesia (contoh: '15 Mei 1990').
 * Kebal terhadap pergeseran zona waktu UTC.
 *
 * @param dateStr - String tanggal (misal: '1990-05-15')
 * @returns {string} String tanggal berbahasa Indonesia
 */
export function formatBirthDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  const cleanDateStr = dateStr.split('T')[0]
  const [yearStr, monthStr, dayStr] = cleanDateStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (!year || !month || !day) {
    const parsed = new Date(dateStr)
    return Number.isNaN(parsed.getTime())
      ? '-'
      : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(parsed)
  }

  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
