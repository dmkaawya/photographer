'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Instagram } from 'lucide-react'

const instagramPosts = [
  { id: 1, image: '/images/gallery-1.jpg', likes: 342 },
  { id: 2, image: '/images/gallery-2.jpg', likes: 287 },
  { id: 3, image: '/images/gallery-3.jpg', likes: 512 },
  { id: 4, image: '/images/gallery-4.jpg', likes: 198 },
  { id: 5, image: '/images/gallery-5.jpg', likes: 421 },
  { id: 6, image: '/images/gallery-6.jpg', likes: 356 },
]

export function InstagramPreview() {
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
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Instagram className="h-5 w-5 text-gold" />
            <span className="text-xs tracking-[0.5em] text-gold uppercase">Instagram</span>
          </div>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-foreground">
            @sadeepa.photography
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {instagramPosts.map((post, i) => (
            <motion.a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden block"
            >
              <Image
                src={post.image}
                alt="Instagram post"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                  <Instagram className="h-6 w-6 text-white mx-auto mb-1" />
                  <span className="text-white text-xs">♥ {post.likes}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-gold border border-gold/30 px-8 py-3 hover:bg-gold hover:text-black transition-all duration-300"
          >
            <Instagram className="h-4 w-4" />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  )
}
