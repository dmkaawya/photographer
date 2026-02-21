export interface GalleryImage {
  id: string
  title: string
  category: 'wedding' | 'pre-shoot' | 'events' | 'modeling'
  image_url: string
  sort_order: number
  created_at: string
}

export interface Package {
  id: string
  name: string
  price: number
  currency: string
  description: string
  features: string[]
  is_enabled: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_name: string
  phone_number: string
  package_id: string
  package_name: string
  event_date: string
  message: string
  location_lat: number
  location_lng: number
  location_address: string
  location_link: string
  status: 'pending' | 'confirmed' | 'cancelled'
  invoice_number: string
  created_at: string
}

export type GalleryCategory = 'all' | 'wedding' | 'pre-shoot' | 'events' | 'modeling'
