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
