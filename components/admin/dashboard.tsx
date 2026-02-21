'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Package, Image, Calendar, LogOut,
  Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Check, Camera
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Package as PackageType, GalleryImage, Booking } from '@/types'

type Tab = 'packages' | 'gallery' | 'bookings'

interface Props {
  packages: PackageType[]
  images: GalleryImage[]
  bookings: Booking[]
  user: User
}

export function AdminDashboard({ packages: initialPackages, images: initialImages, bookings, user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('packages')
  const [packages, setPackages] = useState(initialPackages)
  const [images, setImages] = useState(initialImages)
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null)
  const [showNewPackageForm, setShowNewPackageForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const togglePackage = async (pkg: PackageType) => {
    const { data } = await supabase
      .from('packages')
      .update({ is_enabled: !pkg.is_enabled })
      .eq('id', pkg.id)
      .select()
      .single()
    if (data) setPackages(ps => ps.map(p => p.id === pkg.id ? data : p))
  }

  const deletePackage = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('packages').delete().eq('id', id)
    setPackages(ps => ps.filter(p => p.id !== id))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    for (const file of files) {
      const path = `gallery/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file)
      if (uploadError) continue

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path)
      const { data } = await supabase.from('gallery_images').insert({
        title: file.name.split('.')[0],
        category: 'wedding',
        image_url: publicUrl,
        sort_order: images.length + 1,
      }).select().single()

      if (data) setImages(imgs => [...imgs, data])
    }
  }

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm('Delete this image?')) return
    const path = img.image_url.split('/gallery/')[1]
    await supabase.storage.from('gallery').remove([`gallery/${path}`])
    await supabase.from('gallery_images').delete().eq('id', img.id)
    setImages(imgs => imgs.filter(i => i.id !== img.id))
  }

  const tabs = [
    { id: 'packages' as Tab, label: 'Packages', icon: Package },
    { id: 'gallery' as Tab, label: 'Gallery', icon: Image },
    { id: 'bookings' as Tab, label: 'Bookings', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" />
            <div>
              <span className="block text-foreground font-bold text-sm">Sadeepa</span>
              <span className="block text-gold text-[10px] tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                activeTab === id
                  ? 'bg-gold text-black font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-3 truncate">{user.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-gold/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold font-[var(--font-playfair)] text-foreground">Packages</h1>
                <p className="text-muted-foreground text-sm mt-1">{packages.length} packages total</p>
              </div>
              <button
                onClick={() => setShowNewPackageForm(true)}
                className="bg-gold text-black px-4 py-2.5 text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-gold-light transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Package
              </button>
            </div>

            <div className="space-y-4">
              {packages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  layout
                  className="bg-card border border-border p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                      {pkg.is_featured && <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 tracking-widest uppercase">Featured</span>}
                      {!pkg.is_enabled && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 tracking-widest uppercase">Disabled</span>}
                    </div>
                    <p className="text-gold font-bold mt-1">{formatCurrency(pkg.price, pkg.currency)}</p>
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{pkg.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePackage(pkg)}
                      className="p-2 border border-border hover:border-gold/30 transition-colors text-muted-foreground hover:text-gold"
                      title={pkg.is_enabled ? 'Disable' : 'Enable'}
                    >
                      {pkg.is_enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="p-2 border border-border hover:border-gold/30 transition-colors text-muted-foreground hover:text-gold"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="p-2 border border-border hover:border-destructive/30 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold font-[var(--font-playfair)] text-foreground">Gallery</h1>
                <p className="text-muted-foreground text-sm mt-1">{images.length} images</p>
              </div>
              <label className="bg-gold text-black px-4 py-2.5 text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-gold-light transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                Upload Images
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden bg-card border border-border">
                  <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200">
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <span className="text-white text-xs text-center px-1">{img.title}</span>
                      <button
                        onClick={() => deleteImage(img)}
                        className="bg-destructive text-white p-1.5 hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold font-[var(--font-playfair)] text-foreground">Bookings</h1>
              <p className="text-muted-foreground text-sm mt-1">{bookings.length} total bookings</p>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No bookings yet</p>
                </div>
              )}
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-card border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{booking.client_name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 tracking-widest uppercase ${
                          booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          booking.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                          'bg-gold/20 text-gold'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📞 {booking.phone_number}</p>
                        <p>📦 {booking.package_name}</p>
                        <p>📅 {new Date(booking.event_date).toLocaleDateString('en-LK')}</p>
                        <p>📍 {booking.location_address}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>#{booking.invoice_number}</p>
                      <p>{new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
