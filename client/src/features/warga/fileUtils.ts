const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
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
