/** Formats an ISO date string into a concise English date representation. */
export function formatDate(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return '-'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(parsed)
}
