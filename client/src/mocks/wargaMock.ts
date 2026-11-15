import type { WargaDetail, WargaListItem } from '../types'

const WARGA_STORAGE_KEY = 'warga-halim-mock-warga-v2'

function createMockWargaPhotoUrl(
  initials: string,
  fullName: string,
  label: string,
  accentHex: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#f0f9ff"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#sky)"/>
    <rect x="48" y="48" width="704" height="504" rx="24" fill="#ffffff" stroke="#bae6fd" stroke-width="4"/>
    <circle cx="400" cy="220" r="84" fill="${accentHex}" opacity="0.15"/>
    <circle cx="400" cy="220" r="68" fill="${accentHex}"/>
    <text x="400" y="238" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="#ffffff">${initials}</text>
    <text x="400" y="365" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="700" fill="#0369a1">${fullName}</text>
    <text x="400" y="415" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#475569">${label}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const DEFAULT_WARGA: WargaDetail[] = [
  {
    id: 1,
    full_name: 'Siti Rahma',
    city: 'Bandung',
    contact: 'IG: @sitirahma',
    message_impression:
      'Thank you for seven unforgettable years together. I gained invaluable lessons and lifelong friendships here.',
    photos: [
      {
        id: 1001,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 1002,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Lembang Outing 2019', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 1003,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Year-End Townhall', '#0369a1'),
        sort_order: 3,
      },
      {
        id: 1004,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Team Lunch Gathering', '#dc2626'),
        sort_order: 4,
      },
    ],
  },
  {
    id: 2,
    full_name: 'Budi Santoso',
    city: 'South Jakarta',
    contact: 'WA: 0812-3456-7890',
    message_impression:
      'Even though the office doors have closed, our bond stays strong. Wishing every Warga Halim alumnus continued success.',
    photos: [
      {
        id: 2001,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 2002,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', '10th Anniversary', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 2003,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', 'Office Futsal Cup', '#0369a1'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 3,
    full_name: 'Andi Wijaya',
    city: 'Yogyakarta',
    contact: 'Email: andi.wijaya@contoh.com',
    message_impression:
      'I still remember our late-night release sprints like yesterday. Easily the best team I have ever worked with.',
    photos: [
      {
        id: 3001,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 3002,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Team Workshop 2021', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 3003,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Annual Iftar Dinner', '#0369a1'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 4,
    full_name: 'Dewi Lestari',
    city: 'Surabaya',
    contact: null,
    message_impression:
      'Afternoon coffee chats in the pantry and casual Friday discussions will always be deeply missed.',
    photos: [
      {
        id: 4001,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 4002,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Gift Exchange Night', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 4003,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Group Studio Portrait', '#0369a1'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 5,
    full_name: 'Rizky Pratama',
    city: 'Semarang',
    contact: 'LinkedIn: rizky-pratama',
    message_impression: null,
    photos: [
      {
        id: 5001,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 5002,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Puncak Team Retreat', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 5003,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Final Day at Halim', '#0369a1'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 6,
    full_name: 'Nadia Kusuma',
    city: 'Malang',
    contact: 'IG: @nadiakusuma',
    message_impression:
      'Thank you for being my second family away from home. Looking forward to seeing everyone at the next reunion!',
    photos: [
      {
        id: 6001,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Primary Profile Photo', '#0284c7'),
        sort_order: 1,
      },
      {
        id: 6002,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Nature Retreat Trip', '#dc2626'),
        sort_order: 2,
      },
      {
        id: 6003,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Farewell Celebration', '#0369a1'),
        sort_order: 3,
      },
    ],
  },
]

function loadMockWarga(): WargaDetail[] {
  try {
    const raw = localStorage.getItem(WARGA_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(WARGA_STORAGE_KEY, JSON.stringify(DEFAULT_WARGA))
      return [...DEFAULT_WARGA]
    }
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as WargaDetail[]
    }
  } catch {
    // Fall back to default members if storage parsing fails
  }
  localStorage.setItem(WARGA_STORAGE_KEY, JSON.stringify(DEFAULT_WARGA))
  return [...DEFAULT_WARGA]
}

function saveMockWarga(items: WargaDetail[]): void {
  try {
    localStorage.setItem(WARGA_STORAGE_KEY, JSON.stringify(items))
  } catch {
    throw new Error(
      'Browser storage is full. Please use smaller image files in simulation mode.',
    )
  }
}

export function getMockWargaList(search = ''): WargaListItem[] {
  const keyword = search.trim().toLowerCase()
  const items = loadMockWarga()

  return items
    .filter((item) => !keyword || item.full_name.toLowerCase().includes(keyword))
    .sort((a, b) => a.full_name.localeCompare(b.full_name, 'en'))
    .map((item) => {
      const sortedPhotos = [...item.photos].sort((a, b) => a.sort_order - b.sort_order)
      return {
        id: item.id,
        full_name: item.full_name,
        city: item.city,
        card_photo_url: sortedPhotos[0]?.photo_url ?? null,
      }
    })
}

export function getMockWargaById(id: number): WargaDetail | null {
  const found = loadMockWarga().find((item) => item.id === id)
  if (!found) return null

  return {
    ...found,
    photos: [...found.photos].sort((a, b) => a.sort_order - b.sort_order),
  }
}

export function createMockWarga(input: {
  full_name: string
  city: string
  contact: string | null
  message_impression: string | null
  photoUrls: string[]
}): WargaDetail {
  if (input.photoUrls.length < 3 || input.photoUrls.length > 10) {
    throw new Error('Member profile must have between 3 and 10 photos')
  }

  const items = loadMockWarga()
  const nextWargaId = items.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
  const maxPhotoId = items.reduce(
    (maxId, item) => Math.max(maxId, ...item.photos.map((photo) => photo.id)),
    0,
  )

  const created: WargaDetail = {
    id: nextWargaId,
    full_name: input.full_name.trim(),
    city: input.city.trim(),
    contact: input.contact?.trim() || null,
    message_impression: input.message_impression?.trim() || null,
    photos: input.photoUrls.map((url, index) => ({
      id: maxPhotoId + index + 1,
      photo_url: url,
      sort_order: index + 1,
    })),
  }

  saveMockWarga([...items, created])
  return created
}

export function updateMockWarga(
  id: number,
  input: {
    full_name: string
    city: string
    contact: string | null
    message_impression: string | null
    photo_order: string[]
    newPhotoUrls: string[]
  },
): WargaDetail {
  if (input.photo_order.length < 3 || input.photo_order.length > 10) {
    throw new Error('Member profile must have between 3 and 10 photos')
  }

  const items = loadMockWarga()
  const existing = items.find((item) => item.id === id)
  if (!existing) {
    throw new Error('Member profile not found')
  }

  let nextPhotoId =
    items.reduce((maxId, item) => Math.max(maxId, ...item.photos.map((photo) => photo.id)), 0) + 1

  const resolvedPhotos = input.photo_order.map((token, index) => {
    if (token.startsWith('existing:')) {
      const photoId = Number(token.slice('existing:'.length))
      const oldPhoto = existing.photos.find((photo) => photo.id === photoId)
      if (!oldPhoto) {
        throw new Error('Invalid existing photo reference')
      }
      return { ...oldPhoto, sort_order: index + 1 }
    }

    if (token.startsWith('new:')) {
      const fileIndex = Number(token.slice('new:'.length))
      const newUrl = input.newPhotoUrls[fileIndex]
      if (!newUrl) {
        throw new Error('Invalid new photo reference')
      }
      const createdPhoto = {
        id: nextPhotoId,
        photo_url: newUrl,
        sort_order: index + 1,
      }
      nextPhotoId += 1
      return createdPhoto
    }

    throw new Error('Invalid photo order format')
  })

  const updated: WargaDetail = {
    id,
    full_name: input.full_name.trim(),
    city: input.city.trim(),
    contact: input.contact?.trim() || null,
    message_impression: input.message_impression?.trim() || null,
    photos: resolvedPhotos,
  }

  saveMockWarga(items.map((item) => (item.id === id ? updated : item)))
  return updated
}

export function deleteMockWarga(id: number): void {
  const items = loadMockWarga()
  const exists = items.some((item) => item.id === id)
  if (!exists) {
    throw new Error('Member profile not found')
  }
  saveMockWarga(items.filter((item) => item.id !== id))
}
