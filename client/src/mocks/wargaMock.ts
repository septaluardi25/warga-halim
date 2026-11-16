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
    position: 'Finance Manager',
    birth_date: '1992-04-18',
    domicile: 'Jakarta Selatan',
    whatsapp_number: '081234567891',
    social_media: '@sitirahma',
    contact: '081234567891',
    message_impression:
      'Terima kasih atas 7 tahun yang berharga dan penuh kenangan. Banyak pelajaran dan sahabat sejati yang saya temukan di sini.',
    photos: [
      {
        id: 1001,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 1002,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Lembang Outing 2019', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 1003,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Year-End Townhall', '#004578'),
        sort_order: 3,
      },
      {
        id: 1004,
        photo_url: createMockWargaPhotoUrl('SR', 'Siti Rahma', 'Team Lunch Gathering', '#005A9C'),
        sort_order: 4,
      },
    ],
  },
  {
    id: 2,
    full_name: 'Budi Santoso',
    position: 'Operations Lead',
    birth_date: '1989-11-25',
    domicile: 'Jakarta Timur',
    whatsapp_number: '081234567890',
    social_media: '@budi_santoso',
    contact: '081234567890',
    message_impression:
      'Meskipun perjalanan kantor telah usai, silaturahmi kita tetap terjaga erat selamanya. Salam sukses untuk seluruh alumni Halim!',
    photos: [
      {
        id: 2001,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 2002,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', '10th Anniversary', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 2003,
        photo_url: createMockWargaPhotoUrl('BS', 'Budi Santoso', 'Office Futsal Cup', '#004578'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 3,
    full_name: 'Andi Wijaya',
    position: 'Senior Engineer',
    birth_date: '1991-08-14',
    domicile: 'Bekasi',
    whatsapp_number: '081234567893',
    social_media: '@andiwijaya',
    contact: '081234567893',
    message_impression:
      'Masih teringat begadang bersama saat rilis produk baru. Tim terbaik yang pernah saya temui sepanjang karir.',
    photos: [
      {
        id: 3001,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 3002,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Team Workshop 2021', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 3003,
        photo_url: createMockWargaPhotoUrl('AW', 'Andi Wijaya', 'Annual Iftar Dinner', '#004578'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 4,
    full_name: 'Dewi Lestari',
    position: 'HR Specialist',
    birth_date: '1993-02-09',
    domicile: 'Depok',
    whatsapp_number: null,
    social_media: null,
    contact: null,
    message_impression:
      'Obrolan santai di pantry sore hari dan tawa bersama rekan kerja selalu menjadi momen yang paling dirindukan.',
    photos: [
      {
        id: 4001,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 4002,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Gift Exchange Night', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 4003,
        photo_url: createMockWargaPhotoUrl('DL', 'Dewi Lestari', 'Group Studio Portrait', '#004578'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 5,
    full_name: 'Rizky Pratama',
    position: 'Product Designer',
    birth_date: '1994-07-30',
    domicile: 'Tangerang Selatan',
    whatsapp_number: null,
    social_media: 'https://linkedin.com/in/rizky-pratama',
    contact: null,
    message_impression: null,
    photos: [
      {
        id: 5001,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 5002,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Puncak Team Retreat', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 5003,
        photo_url: createMockWargaPhotoUrl('RP', 'Rizky Pratama', 'Final Day at Halim', '#004578'),
        sort_order: 3,
      },
    ],
  },
  {
    id: 6,
    full_name: 'Nadia Kusuma',
    position: 'Marketing Strategist',
    birth_date: '1995-12-12',
    domicile: 'Bogor',
    whatsapp_number: '081298765432',
    social_media: '@nadiakusuma',
    contact: '081298765432',
    message_impression:
      'Kalian adalah keluarga kedua bagi saya. Semoga kita semua selalu sehat dan sukses sampai reuni akbar nanti!',
    photos: [
      {
        id: 6001,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Foto Profil Utama', '#005A9C'),
        sort_order: 1,
      },
      {
        id: 6002,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Nature Retreat Trip', '#005A9C'),
        sort_order: 2,
      },
      {
        id: 6003,
        photo_url: createMockWargaPhotoUrl('NK', 'Nadia Kusuma', 'Farewell Celebration', '#004578'),
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
      'Penyimpanan browser penuh. Harap gunakan file gambar yang lebih kecil.',
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
        position: item.position,
        domicile: item.domicile ?? 'Jakarta',
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
  position: string
  birth_date?: string
  domicile?: string
  whatsapp_number?: string | null
  social_media?: string | null
  contact?: string | null
  message_impression: string | null
  photoUrls: string[]
}): WargaDetail {
  if (input.photoUrls.length < 3 || input.photoUrls.length > 10) {
    throw new Error('Foto biodata warga harus berjumlah antara 3 sampai 10 foto')
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
    position: input.position.trim(),
    birth_date: input.birth_date?.trim() || '1995-01-01',
    domicile: input.domicile?.trim() || 'Jakarta',
    whatsapp_number: input.whatsapp_number?.trim() || input.contact?.trim() || null,
    social_media: input.social_media?.trim() || null,
    contact: input.whatsapp_number?.trim() || input.contact?.trim() || null,
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
    position: string
    birth_date?: string
    domicile?: string
    whatsapp_number?: string | null
    social_media?: string | null
    contact?: string | null
    message_impression: string | null
    photo_order: string[]
    newPhotoUrls: string[]
  },
): WargaDetail {
  if (input.photo_order.length < 3 || input.photo_order.length > 10) {
    throw new Error('Foto biodata warga harus berjumlah antara 3 sampai 10 foto')
  }

  const items = loadMockWarga()
  const existing = items.find((item) => item.id === id)
  if (!existing) {
    throw new Error('Data warga tidak ditemukan')
  }

  let nextPhotoId =
    items.reduce((maxId, item) => Math.max(maxId, ...item.photos.map((photo) => photo.id)), 0) + 1

  const resolvedPhotos = input.photo_order.map((token, index) => {
    if (token.startsWith('existing:')) {
      const photoId = Number(token.slice('existing:'.length))
      const oldPhoto = existing.photos.find((photo) => photo.id === photoId)
      if (!oldPhoto) {
        throw new Error('Referensi foto lama tidak valid')
      }
      return { ...oldPhoto, sort_order: index + 1 }
    }

    if (token.startsWith('new:')) {
      const fileIndex = Number(token.slice('new:'.length))
      const newUrl = input.newPhotoUrls[fileIndex]
      if (!newUrl) {
        throw new Error('Referensi foto baru tidak valid')
      }
      const createdPhoto = {
        id: nextPhotoId,
        photo_url: newUrl,
        sort_order: index + 1,
      }
      nextPhotoId += 1
      return createdPhoto
    }

    throw new Error('Format urutan foto tidak valid')
  })

  const updated: WargaDetail = {
    id,
    full_name: input.full_name.trim(),
    position: input.position.trim(),
    birth_date: input.birth_date?.trim() || existing.birth_date || '1995-01-01',
    domicile: input.domicile?.trim() || existing.domicile || 'Jakarta',
    whatsapp_number: input.whatsapp_number?.trim() || input.contact?.trim() || null,
    social_media: input.social_media?.trim() || null,
    contact: input.whatsapp_number?.trim() || input.contact?.trim() || null,
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
    throw new Error('Data warga tidak ditemukan')
  }
  saveMockWarga(items.filter((item) => item.id !== id))
}
