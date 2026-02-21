'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Amali & Kasun',
    event: 'Wedding Photography',
    rating: 5,
    text: 'Sadeepa captured our wedding day flawlessly. Every photo tells a story, and each image is a timeless treasure we\'ll cherish forever. The attention to detail and artistic vision exceeded our expectations.',
    location: 'Colombo',
  },
  {
    id: 2,
    name: 'Nilufar Rashid',
    event: 'Modeling Portfolio',
    rating: 5,
    text: 'Working with Sadeepa Photography was an absolute pleasure. The 3D lighting techniques and creative direction helped bring out the best in every shot. My portfolio has never looked better!',
    location: 'Kandy',
  },
  {
    id: 3,
    name: 'The Perera Family',
    event: 'Pre-Wedding Shoot',
    rating: 5,
    text: 'From the very first meeting to the final delivery of photos, everything was perfectly handled. The pre-shoot locations were stunning and the final images are beyond beautiful.',
    location: 'Galle',
  },
  {
    id: 4,
    name: 'Sampath Corporations',
    event: 'Corporate Event',
    rating: 5,
    text: 'Professionalism at its finest. Sadeepa and team managed our large corporate event seamlessly, capturing every important moment without being intrusive. Highly recommended!',
    location: 'Colombo',
  },
]

export function Testimonials() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const prev = () => setActive((i) => (i === 0 ? testimonials.length - 1 : i - 1))
  const next = () => setActive((i) => (i === testimonials.length - 1 ? 0 : i + 1))

  return (
    <section className="py-24 px-6 lg:px-8 bg-card/50 border-y border-gold/10">
      <div className="mx-auto max-w-4xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.5em] text-gold uppercase">Testimonials</span>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-foreground mt-3">
            Client Stories
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gold" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative"
        >
          <Quote className="absolute -top-4 -left-4 h-16 w-16 text-gold/10 rotate-180" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="text-center px-8"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-foreground/80 text-lg md:text-xl leading-relaxed font-[var(--font-playfair)] italic mb-8">
                "{testimonials[active].text}"
              </p>
              <div>
                <p className="text-foreground font-semibold">{testimonials[active].name}</p>
                <p className="text-gold text-xs tracking-[0.3em] uppercase mt-1">
                  {testimonials[active].event} · {testimonials[active].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prev}
              className="p-2 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 transition-all duration-300 ${
                    i === active ? 'w-8 bg-gold' : 'w-2 bg-gold/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
