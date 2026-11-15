/**
 * Kelas error aplikasi kustom yang membawa kode status HTTP.
 * Memungkinkan pengiriman pesan kesalahan terdefinisi ke klien secara seragam melalui errorHandler.
 */
export class AppError extends Error {
  readonly statusCode: number

  /**
   * Menginisialisasi instans AppError baru.
   *
   * @param message - Pesan galat deskriptif dalam Bahasa Indonesia
   * @param statusCode - Kode status HTTP (misal 400, 401, 403, 404, 429, 500)
   */
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}
