import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PackageCards } from "@/components/packages/package-cards"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Packages | Sadeepa Photography",
  description: "Explore our premium photography packages tailored for weddings, events, and more.",
}

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <section className="px-6 pt-32 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-xs tracking-[0.5em] text-gold uppercase font-[var(--font-inter)]">
              Investment
            </span>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
              Our Packages
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground font-[var(--font-inter)]">
              Choose the perfect package for your special occasion. Each crafted to deliver an exceptional experience.
            </p>
            <div className="mx-auto mt-4 h-px w-16 bg-gold" />
          </div>
          <PackageCards packages={packages ?? []} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
