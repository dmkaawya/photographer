'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

const featuredWorks = [
  {
    id: 1,
    title: 'Eternal Vows',
    category: 'Wedding',
    image: '/images/gallery-1.jpg',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 2,
    title: 'Golden Hour',
    category: 'Pre-Shoot',
    image: '/images/gallery-2.jpg',
    span: 'col-span-1',
  },
  {
    id: 3,
    title: 'Elegance',
    category: 'Modeling',
    image: '/images/gallery-3.jpg',
    span: 'col-span-1',
  },
  {
    id: 4,
    title: 'Grand Celebration',
    category: 'Events',
    image: '/images/gallery-4.jpg',
    span: 'col-span-2',
  },
]

function WorkCard({ work, index }: { work: typeof featuredWorks[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`group relative overflow-hidden cursor-pointer ${work.span}`}
      style={{ perspective: '1000px' }}
    >
      <div className="relative w-full h-full min-h-[300px] transition-transform duration-500 group-hover:[transform:rotateY(2deg)_rotateX(-2deg)_scale(1.02)]">
        <Image
          src={work.image}
          alt={work.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-gold text-xs tracking-[0.3em] uppercase">{work.category}</span>
          <h3 className="text-white font-[var(--font-playfair)] text-xl font-bold mt-1">{work.title}</h3>
        </div>
        {/* Gold border on hover */}
        <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/50 transition-colors duration-300" />
      </div>
    </motion.div>
  )
}

export function FeaturedWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-24 px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span className="text-xs tracking-[0.5em] text-gold uppercase">Portfolio</span>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-foreground mt-3">
              Featured Works
            </h2>
          </div>
          <Link
            href="/gallery"
            className="text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-gold border-b border-muted-foreground/30 hover:border-gold pb-0.5 transition-colors self-start md:self-auto"
          >
            View All →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
          {featuredWorks.map((work, i) => (
            <WorkCard key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
