'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Star, ArrowRight, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Package } from '@/types'

const demoPackages: Package[] = [
  {
    id: '1',
    name: 'Essential',
    price: 25000,
    currency: 'LKR',
    description: 'Perfect for intimate gatherings and pre-shoots. Professional coverage with quick delivery.',
    features: ['4 Hours Coverage', '200 Edited Photos', 'Online Gallery', '1 Photographer', 'Basic Retouching'],
    is_enabled: true,
    is_featured: false,
    sort_order: 1,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'Premium',
    price: 55000,
    currency: 'LKR',
    description: 'Our most popular package for weddings and events. Comprehensive coverage with cinematic results.',
    features: ['8 Hours Coverage', '500 Edited Photos', 'Online Gallery', '2 Photographers', 'Advanced Retouching', 'Same Day Preview', 'USB Drive'],
    is_enabled: true,
    is_featured: true,
    sort_order: 2,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    name: 'Luxury',
    price: 95000,
    currency: 'LKR',
    description: 'The ultimate photography experience. Full day coverage with cinematic video and premium album.',
    features: ['12 Hours Coverage', 'Unlimited Photos', 'Private Gallery', '3 Photographers', 'Cinematic Video', 'Premium Album', 'Drone Shots', 'Rush Delivery'],
    is_enabled: true,
    is_featured: false,
    sort_order: 3,
    created_at: '',
    updated_at: '',
  },
]

interface PackageModalProps {
  pkg: Package
  onClose: () => void
}

function PackageModal({ pkg, onClose }: PackageModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-card border border-gold/20 max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {pkg.is_featured && (
          <div className="flex items-center gap-1.5 mb-4">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Most Popular</span>
          </div>
        )}

        <h3 className="font-[var(--font-playfair)] text-3xl font-bold text-foreground">{pkg.name}</h3>
        <div className="mt-3 mb-6">
          <span className="text-gold text-3xl font-bold">{formatCurrency(pkg.price, pkg.currency)}</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{pkg.description}</p>

        <ul className="space-y-3 mb-8">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-foreground/80">
              <Check className="h-4 w-4 text-gold flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href={`/booking?package=${encodeURIComponent(pkg.name)}`}
          className="block w-full bg-gold text-black text-center py-3.5 text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-colors"
        >
          Book This Package
        </Link>
      </motion.div>
    </motion.div>
  )
}

interface Props {
  packages: Package[]
}

export function PackageCards({ packages }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const displayPackages = packages.length > 0 ? packages : demoPackages

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {displayPackages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className={`relative group cursor-pointer flex flex-col border transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_40px_rgba(200,164,94,0.1)] ${
              pkg.is_featured
                ? 'border-gold/50 bg-card'
                : 'border-border bg-card/50'
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            {pkg.is_featured && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-gold text-black text-[10px] tracking-[0.3em] uppercase px-4 py-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-8 flex-1">
              <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
              <div className="mb-6">
                <span className="text-gold text-4xl font-bold">{formatCurrency(pkg.price, pkg.currency)}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">{pkg.description}</p>

              <ul className="space-y-3">
                {pkg.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground/70">
                    <div className="h-1 w-1 rounded-full bg-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {pkg.features.length > 5 && (
                  <li className="text-gold text-xs tracking-widest">+{pkg.features.length - 5} more features</li>
                )}
              </ul>
            </div>

            <div className="p-8 pt-0">
              <button className={`w-full py-3.5 text-sm tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                pkg.is_featured
                  ? 'bg-gold text-black hover:bg-gold-light'
                  : 'border border-gold/30 text-gold hover:bg-gold hover:text-black'
              }`}>
                View Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPackage && (
          <PackageModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
