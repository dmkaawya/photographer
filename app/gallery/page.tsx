import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Gallery | Sadeepa Photography",
  description: "Browse our portfolio of stunning wedding, pre-shoot, event, and modeling photography.",
}

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <section className="px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-xs tracking-[0.5em] text-gold uppercase font-[var(--font-inter)]">
              Portfolio
            </span>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Our Gallery
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground font-[var(--font-inter)]">
              A curated collection of our finest moments, each frame crafted with passion and precision.
            </p>
            <div className="mx-auto mt-4 h-px w-16 bg-gold" />
          </div>
          <GalleryGrid initialImages={images ?? []} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
