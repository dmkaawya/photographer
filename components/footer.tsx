import Link from 'next/link'
import { Camera, Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gold/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Camera className="h-5 w-5 text-gold" />
              <div>
                <span className="block text-foreground font-[var(--font-playfair)] text-lg font-bold leading-none">Sadeepa</span>
                <span className="block text-gold text-[10px] tracking-[0.4em] uppercase leading-none mt-0.5">Photography</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Capturing life's most precious moments with artistry and passion. Based in Sri Lanka, available worldwide.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs tracking-[0.3em] uppercase text-gold mb-6">Navigation</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/packages', label: 'Packages' },
                { href: '/booking', label: 'Book a Session' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-[0.3em] uppercase text-gold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <a href="tel:+94771234567" className="hover:text-foreground transition-colors">+94 77 123 4567</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <a href="mailto:hello@sadeepa.photography" className="hover:text-foreground transition-colors">hello@sadeepa.photography</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                <span>Colombo, Sri Lanka<br />Available Islandwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Sadeepa Photography. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Crafted with <span className="text-gold">♥</span> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  )
}
