const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  const extIndex = file.name.lastIndexOf('.')
  const ext = extIndex !== -1 ? file.name.slice(extIndex).toLowerCase() : ''

  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
    return `"${file.name}" harus berupa file gambar JPG, PNG, atau WEBP.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Ukuran file "${file.name}" melebihi batas maksimal 2 MB.`
  }
  return null
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error(`Failed to read file ${file.name}`))
      }
    }
    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`))
    reader.readAsDataURL(file)
  })
}
