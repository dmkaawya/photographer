import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BookingForm } from '@/components/booking/booking-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Book a Session | Sadeepa Photography',
  description: 'Book your photography session with Sadeepa Photography. Choose your package, select a date, and let us capture your precious moments.',
}

export default async function BookingPage() {
  const supabase = await createClient()
  const { data: packages } = await supabase
    .from('packages')
    .select('id, name, price, currency')
    .eq('is_enabled', true)
    .order('sort_order', { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <section className="px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs tracking-[0.5em] text-gold uppercase font-[var(--font-inter)]">
              Reserve Your Date
            </span>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl font-[var(--font-playfair)]">
              Book a Session
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Fill in your details below and you'll be redirected to WhatsApp to confirm your booking. An invoice will be auto-generated.
            </p>
            <div className="mx-auto mt-4 h-px w-16 bg-gold" />
          </div>
          <BookingForm packages={packages ?? []} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
