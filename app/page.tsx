import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/home/hero"
import { FeaturedWorks } from "@/components/home/featured-works"
import { Testimonials } from "@/components/home/testimonials"
import { InstagramPreview } from "@/components/home/instagram-preview"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <FeaturedWorks />
      <Testimonials />
      <InstagramPreview />
      <Footer />
    </main>
  )
}
