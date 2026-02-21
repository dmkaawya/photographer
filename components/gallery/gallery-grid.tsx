'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryImage, GalleryCategory } from '@/types'

const categories: { value: GalleryCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'pre-shoot', label: 'Pre-Shoot' },
  { value: 'events', label: 'Events' },
  { value: 'modeling', label: 'Modeling' },
]

// Fallback demo images when no Supabase data
const demoImages: GalleryImage[] = [
  { id: '1', title: 'Eternal Vows', category: 'wedding', image_url: '/images/gallery-1.jpg', sort_order: 1, created_at: '' },
  { id: '2', title: 'Golden Hour', category: 'pre-shoot', image_url: '/images/gallery-2.jpg', sort_order: 2, created_at: '' },
  { id: '3', title: 'Elegance', category: 'modeling', image_url: '/images/gallery-3.jpg', sort_order: 3, created_at: '' },
  { id: '4', title: 'Grand Celebration', category: 'events', image_url: '/images/gallery-4.jpg', sort_order: 4, created_at: '' },
  { id: '5', title: 'Love Story', category: 'pre-shoot', image_url: '/images/gallery-5.jpg', sort_order: 5, created_at: '' },
  { id: '6', title: 'Timeless Moments', category: 'wedding', image_url: '/images/gallery-6.jpg', sort_order: 6, created_at: '' },
  { id: '7', title: 'Runway Ready', category: 'modeling', image_url: '/images/gallery-1.jpg', sort_order: 7, created_at: '' },
  { id: '8', title: 'Corporate Gala', category: 'events', image_url: '/images/gallery-2.jpg', sort_order: 8, created_at: '' },
  { id: '9', title: 'Sunset Dreams', category: 'wedding', image_url: '/images/gallery-3.jpg', sort_order: 9, created_at: '' },
]

interface Props {
  initialImages: GalleryImage[]
}

export function GalleryGrid({ initialImages }: Props) {
  const images = initialImages.length > 0 ? initialImages : demoImages
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = activeCategory === 'all'
    ? images
    : images.filter((img) => img.category === activeCategory)

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex((i) => i !== null ? (i === 0 ? filtered.length - 1 : i - 1) : null), [filtered.length])
  const nextImage = useCallback(() => setLightboxIndex((i) => i !== null ? (i === filtered.length - 1 ? 0 : i + 1) : null), [filtered.length])

  return (
    <>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-12 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`relative px-6 py-2.5 text-xs tracking-[0.3em] uppercase transition-all duration-300 ${
              activeCategory === cat.value
                ? 'bg-gold text-black'
                : 'border border-gold/30 text-muted-foreground hover:border-gold hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div
        layout
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
      >
        <AnimatePresence>
          {filtered.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="break-inside-avoid group relative overflow-hidden cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => openLightbox(index)}
            >
              <div className="relative transition-transform duration-500 group-hover:[transform:rotateY(3deg)_rotateX(-2deg)_scale(1.02)]">
                <Image
                  src={image.image_url}
                  alt={image.title}
                  width={600}
                  height={index % 3 === 0 ? 800 : 500}
                  className="w-full object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
                <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="h-8 w-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-gold text-xs tracking-[0.3em] uppercase">{image.category}</span>
                  <p className="text-white font-[var(--font-playfair)] font-bold mt-0.5">{image.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].image_url}
                alt={filtered[lightboxIndex].title}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-6 text-center">
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{filtered[lightboxIndex].category}</span>
                <p className="text-white font-[var(--font-playfair)] text-xl font-bold mt-1">{filtered[lightboxIndex].title}</p>
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm">
              {lightboxIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
