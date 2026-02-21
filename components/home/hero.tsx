'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ChevronRight } from 'lucide-react'

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </motion.div>

      {/* Grain overlay */}
      <div className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px'
        }}
      />

      {/* Gold corner accents */}
      <div className="absolute top-24 left-8 w-16 h-16 border-t border-l border-gold/40 z-10" />
      <div className="absolute top-24 right-8 w-16 h-16 border-t border-r border-gold/40 z-10" />
      <div className="absolute bottom-16 left-8 w-16 h-16 border-b border-l border-gold/40 z-10" />
      <div className="absolute bottom-16 right-8 w-16 h-16 border-b border-r border-gold/40 z-10" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block text-xs tracking-[0.6em] text-gold uppercase mb-6 font-[var(--font-inter)]">
            Luxury Photography
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-[var(--font-playfair)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tight mb-6"
        >
          Sadeepa
          <br />
          <span className="text-gold italic">Photography</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-[var(--font-inter)]"
        >
          Every moment tells a story. We capture yours with artistry, elegance, and timeless precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/booking"
            className="group relative overflow-hidden bg-gold text-black px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,164,94,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book a Session
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gold-light translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          </Link>
          <Link
            href="/gallery"
            className="text-white/70 hover:text-white text-sm tracking-[0.2em] uppercase border-b border-white/30 hover:border-white pb-0.5 transition-colors"
          >
            View Gallery
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="h-4 w-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  )
}
