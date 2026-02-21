'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, Package, Calendar, MessageSquare,
  MapPin, Send, FileText, Loader2, Navigation,
  Copy, Check, MessageCircle, ExternalLink, Eye,
  EyeOff, Crosshair, Map, X
} from 'lucide-react'
import { generateInvoiceNumber, generateWhatsAppMessage, formatCurrency } from '@/lib/utils'

/* ─── Types ─── */
interface PackageOption { id: string; name: string; price: number; currency: string }
interface SelectedLocation { lat: number; lng: number; address?: string }
interface FormData {
  clientName: string; phoneNumber: string; packageId: string
  eventDate: string; message: string
}

/* ─── Constants ─── */
const COLOMBO = { lat: 6.9271, lng: 79.8612 }
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94771234567'

const DEMO_PACKAGES: PackageOption[] = [
  { id: '1', name: 'Essential', price: 25000, currency: 'LKR' },
  { id: '2', name: 'Premium', price: 55000, currency: 'LKR' },
  { id: '3', name: 'Luxury', price: 95000, currency: 'LKR' },
]

/* ─── Helpers ─── */
function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
}

/* ─── Copy Button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 border border-[#c8a45e]/30 text-[#c8a45e] text-xs tracking-widest uppercase hover:bg-[#c8a45e] hover:text-black transition-all duration-200 whitespace-nowrap">
      <AnimatePresence mode="wait">
        {copied
          ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1"><Check className="h-3 w-3" /> Copied</motion.span>
          : <motion.span key="u" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</motion.span>
        }
      </AnimatePresence>
    </button>
  )
}

/* ─── Interactive Map ─── */
function InteractiveMap({ onSelect, selected }: { onSelect: (l: SelectedLocation) => void; selected: SelectedLocation | null }) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [noKey, setNoKey] = useState(false)

  const placeMarker = (lat: number, lng: number, map: google.maps.Map) => {
    markerRef.current?.setMap(null)
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng }, map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10, fillColor: '#c8a45e', fillOpacity: 1,
        strokeColor: '#0a0a0a', strokeWeight: 3,
      },
      animation: window.google.maps.Animation.DROP,
    })
  }

  const initMap = useCallback(() => {
    if (!divRef.current || !window.google) return
    const map = new window.google.maps.Map(divRef.current, {
      center: COLOMBO, zoom: 13,
      disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#c8a45e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3020' }] },
        { featureType: 'water', stylers: [{ color: '#0d1117' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8a45e' }, { weight: 0.5 }] },
      ],
    })
    mapRef.current = map
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const lat = e.latLng.lat(), lng = e.latLng.lng()
      placeMarker(lat, lng, map)
      onSelect({ lat, lng })
      if (window.google?.maps) {
        new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (res, status) => {
          if (status === 'OK' && res?.[0]) onSelect({ lat, lng, address: res[0].formatted_address })
        })
      }
    })
    setLoading(false)
  }, [onSelect])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.google?.maps) { initMap(); return }
    if (!MAPS_API_KEY) { setNoKey(true); setLoading(false); return }
    const existing = document.getElementById('gmap-script')
    if (existing) { existing.addEventListener('load', initMap); return }
    const s = document.createElement('script')
    s.id = 'gmap-script'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`
    s.async = true; s.defer = true
    s.onload = initMap
    s.onerror = () => { setNoKey(true); setLoading(false) }
    document.head.appendChild(s)
  }, [initMap])

  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.panTo({ lat: selected.lat, lng: selected.lng })
      placeMarker(selected.lat, selected.lng, mapRef.current)
    }
  }, [selected])

  if (noKey) return (
    <div className="w-full h-[360px] bg-[#111] border border-[#c8a45e]/20 flex flex-col items-center justify-center gap-3 text-center px-6">
      <MapPin className="h-8 w-8 text-[#c8a45e]/30" />
      <p className="text-[#8a8278] text-xs">Google Maps API key not set.<br />
        <span className="text-[#c8a45e]">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</span></p>
      {/* Manual input fallback */}
      <ManualCoordInput onSelect={onSelect} />
    </div>
  )

  return (
    <div className="relative w-full h-[360px] overflow-hidden border border-[#c8a45e]/20">
      {loading && (
        <div className="absolute inset-0 bg-[#111] flex items-center justify-center z-10">
          <Loader2 className="h-7 w-7 text-[#c8a45e] animate-spin" />
        </div>
      )}
      <div ref={divRef} className="w-full h-full" />
      {!loading && !selected && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm border border-[#c8a45e]/30 px-4 py-2 flex items-center gap-2 pointer-events-none">
          <Crosshair className="h-3.5 w-3.5 text-[#c8a45e]" />
          <span className="text-white/70 text-xs tracking-widest uppercase">Click map to pin</span>
        </div>
      )}
    </div>
  )
}

function ManualCoordInput({ onSelect }: { onSelect: (l: SelectedLocation) => void }) {
  const [lat, setLat] = useState('6.9271')
  const [lng, setLng] = useState('79.8612')
  const apply = () => {
    const la = parseFloat(lat), lo = parseFloat(lng)
    if (!isNaN(la) && !isNaN(lo)) onSelect({ lat: la, lng: lo })
  }
  return (
    <div className="w-full mt-2">
      <p className="text-[#c8a45e] text-[10px] tracking-widest uppercase mb-2">Enter Coordinates</p>
      <div className="flex gap-2">
        <input value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude"
          className="flex-1 bg-[#0a0a0a] border border-[#2a2520] text-[#f5f0e8] px-3 py-2 text-xs focus:outline-none focus:border-[#c8a45e] transition-colors" />
        <input value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude"
          className="flex-1 bg-[#0a0a0a] border border-[#2a2520] text-[#f5f0e8] px-3 py-2 text-xs focus:outline-none focus:border-[#c8a45e] transition-colors" />
        <button onClick={apply} className="bg-[#c8a45e] text-black px-4 py-2 text-xs tracking-widest uppercase font-medium hover:bg-[#d4b76a] transition-colors">Set</button>
      </div>
    </div>
  )
}

/* ─── Location Panel (static preview + link) ─── */
function LocationPanel({ location, onClear }: { location: SelectedLocation; onClear: () => void }) {
  const [showSV, setShowSV] = useState(false)
  const link = mapsLink(location.lat, location.lng)
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`📍 Location: ${link}`)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="border border-[#c8a45e]/20 bg-[#0d0d0d] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#111] border-b border-[#2a2520] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-[#c8a45e]" />
          <span className="text-[#c8a45e] text-xs tracking-[0.3em] uppercase">Selected Location</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSV(v => !v)}
            className="flex items-center gap-1.5 text-[#8a8278] hover:text-[#c8a45e] text-xs tracking-widest uppercase transition-colors"
          >
            {showSV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            Street View
          </button>
          <button onClick={onClear} className="text-[#8a8278] hover:text-[#f5f0e8] transition-colors p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Static map */}
      <div className="relative bg-[#1a1a1a] h-40 flex items-center justify-center">
        {MAPS_API_KEY ? (
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=600x200&maptype=roadmap&markers=color:0xc8a45e|${location.lat},${location.lng}&style=element:geometry|color:0x1a1a1a&style=element:labels.text.fill|color:0xc8a45e&style=feature:road|element:geometry|color:0x2a2520&style=feature:water|color:0x0d1117&key=${MAPS_API_KEY}`}
            alt="Location"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <Map className="h-8 w-8 text-[#c8a45e]/30 mx-auto mb-2" />
            <p className="text-[#c8a45e] font-mono text-sm">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
          </div>
        )}
        {/* Blinking pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-3 bg-[#c8a45e]/20 rounded-full blur-md animate-pulse" />
            <div className="relative w-3 h-3 bg-[#c8a45e] rounded-full border-2 border-black" />
          </div>
        </div>
      </div>

      {/* Address + coords */}
      <div className="px-4 py-3 border-b border-[#2a2520]">
        {location.address && (
          <p className="text-[#f5f0e8]/70 text-xs mb-2 leading-relaxed">{location.address}</p>
        )}
        <div className="flex gap-4">
          <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">
            Lat <span className="text-[#c8a45e] font-mono">{location.lat.toFixed(6)}</span>
          </span>
          <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">
            Lng <span className="text-[#c8a45e] font-mono">{location.lng.toFixed(6)}</span>
          </span>
        </div>
      </div>

      {/* Street View */}
      <AnimatePresence>
        {showSV && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 200 }} exit={{ height: 0 }}
            className="overflow-hidden border-b border-[#2a2520]"
          >
            {MAPS_API_KEY ? (
              <iframe
                src={`https://www.google.com/maps/embed/v1/streetview?key=${MAPS_API_KEY}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=90`}
                className="w-full h-full border-0"
                title="Street View"
              />
            ) : (
              <div className="w-full h-full bg-[#111] flex items-center justify-center">
                <p className="text-[#8a8278] text-xs">API key required for Street View</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link + buttons */}
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <input readOnly value={link}
            className="flex-1 bg-[#111] border border-[#2a2520] text-[#f5f0e8]/60 px-3 py-2 text-xs font-mono focus:outline-none truncate" />
          <CopyButton text={link} />
        </div>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] py-2.5 text-xs tracking-widest uppercase hover:bg-[#25D366] hover:text-black transition-all duration-300">
          <MessageCircle className="h-3.5 w-3.5" /> Send via WhatsApp
        </a>
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-[#c8a45e]/20 text-[#c8a45e] py-2.5 text-xs tracking-widest uppercase hover:bg-[#c8a45e]/10 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
        </a>
      </div>
    </motion.div>
  )
}

/* ─── Detect My Location ─── */
function DetectButton({ onDetect }: { onDetect: (l: SelectedLocation) => void }) {
  const [loading, setLoading] = useState(false)
  const detect = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude
        onDetect({ lat, lng })
        setLoading(false)
        if (MAPS_API_KEY && window.google?.maps) {
          new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (res, status) => {
            if (status === 'OK' && res?.[0]) onDetect({ lat, lng, address: res[0].formatted_address })
          })
        }
      },
      () => setLoading(false)
    )
  }
  return (
    <button onClick={detect} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 border border-[#c8a45e]/30 text-[#c8a45e] text-xs tracking-widest uppercase hover:bg-[#c8a45e] hover:text-black transition-all duration-200 disabled:opacity-50">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
      My Location
    </button>
  )
}

/* ─── MAIN BOOKING FORM ─── */
function BookingFormInner({ packages }: { packages: PackageOption[] }) {
  const searchParams = useSearchParams()
  const displayPackages = packages.length > 0 ? packages : DEMO_PACKAGES
  const preselected = searchParams.get('package')

  const [form, setForm] = useState<FormData>({
    clientName: '',
    phoneNumber: '',
    packageId: displayPackages.find(p => p.name === preselected)?.id ?? displayPackages[0]?.id ?? '',
    eventDate: '',
    message: '',
  })
  const [location, setLocation] = useState<SelectedLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPackage = displayPackages.find(p => p.id === form.packageId)
  const upd = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }))

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const invoiceNumber = generateInvoiceNumber()
    const doc = new jsPDF()
    const gold: [number, number, number] = [200, 164, 94]
    const black: [number, number, number] = [10, 10, 10]
    const gray: [number, number, number] = [100, 100, 100]
    const locationLink = location ? mapsLink(location.lat, location.lng) : 'N/A'

    doc.setFillColor(...black); doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('times', 'bold')
    doc.text('SADEEPA PHOTOGRAPHY', 20, 20)
    doc.setFontSize(9); doc.setTextColor(...gold); doc.setFont('helvetica', 'normal')
    doc.text('LUXURY PHOTOGRAPHY SERVICES', 20, 30)
    doc.setFillColor(...gold); doc.rect(0, 40, 210, 2, 'F')

    doc.setTextColor(...black); doc.setFontSize(20); doc.setFont('times', 'bold')
    doc.text('BOOKING INVOICE', 20, 60)
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray)
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 72)
    doc.text(`Date: ${new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 80)

    doc.setDrawColor(...gold); doc.setLineWidth(0.5); doc.line(20, 88, 190, 88)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...black)
    doc.text('CLIENT INFORMATION', 20, 100)

    const details = [
      ['Name', form.clientName],
      ['Phone', form.phoneNumber],
      ['Event Date', new Date(form.eventDate).toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Package', selectedPackage?.name ?? 'N/A'],
      ['Price', formatCurrency(selectedPackage?.price ?? 0, selectedPackage?.currency)],
      ['Location', location?.address ?? locationLink],
      ['Maps Link', locationLink],
    ]
    details.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...black); doc.setFontSize(10)
      doc.text(`${label}:`, 20, 112 + i * 10)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray)
      doc.text(value.length > 60 ? value.slice(0, 57) + '...' : value, 65, 112 + i * 10)
    })

    if (form.message) {
      const yStart = 112 + details.length * 10 + 8
      doc.line(20, yStart, 190, yStart)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...black)
      doc.text('NOTES:', 20, yStart + 10)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...gray)
      doc.text(doc.splitTextToSize(form.message, 150), 20, yStart + 20)
    }

    doc.setFillColor(...black); doc.rect(0, 285, 210, 12, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(8)
    doc.text('Sadeepa Photography | hello@sadeepa.photography | +94 77 123 4567', 105, 292, { align: 'center' })
    doc.save(`Sadeepa-Invoice-${invoiceNumber}.pdf`)
    return invoiceNumber
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName || !form.phoneNumber || !form.packageId || !form.eventDate) return
    setIsSubmitting(true)
    try {
      const invoiceNumber = await generatePDF()
      const locationLink = location ? mapsLink(location.lat, location.lng) : 'Location not specified'
      const msg = generateWhatsAppMessage({
        name: form.clientName,
        packageName: selectedPackage?.name ?? '',
        eventDate: form.eventDate,
        locationLink,
        invoiceNumber,
      })
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = "w-full bg-[#111] border border-[#2a2520] text-[#f5f0e8] px-4 py-3 text-sm focus:outline-none focus:border-[#c8a45e] transition-colors placeholder:text-[#8a8278]/60"
  const labelCls = "flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#8a8278] mb-2"

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Client Name */}
      <div>
        <label className={labelCls}><User className="h-3 w-3 text-[#c8a45e]" /> Client Name</label>
        <input type="text" required value={form.clientName} onChange={upd('clientName')} placeholder="Your full name" className={inputCls} />
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls}><Phone className="h-3 w-3 text-[#c8a45e]" /> Phone Number</label>
        <input type="tel" required value={form.phoneNumber} onChange={upd('phoneNumber')} placeholder="+94 77 123 4567" className={inputCls} />
      </div>

      {/* Package */}
      <div>
        <label className={labelCls}><Package className="h-3 w-3 text-[#c8a45e]" /> Select Package</label>
        <select required value={form.packageId} onChange={upd('packageId')} className={inputCls}>
          {displayPackages.map(pkg => (
            <option key={pkg.id} value={pkg.id} style={{ background: '#111' }}>
              {pkg.name} — {formatCurrency(pkg.price, pkg.currency)}
            </option>
          ))}
        </select>
      </div>

      {/* Event Date */}
      <div>
        <label className={labelCls}><Calendar className="h-3 w-3 text-[#c8a45e]" /> Event Date</label>
        <input type="date" required value={form.eventDate} onChange={upd('eventDate')}
          min={new Date().toISOString().split('T')[0]} className={inputCls} />
      </div>

      {/* ─── LOCATION SELECTOR ─── */}
      <div>
        <label className={labelCls}><MapPin className="h-3 w-3 text-[#c8a45e]" /> Event Location</label>

        <div className="border border-[#2a2520] bg-[#0a0a0a] overflow-hidden">
          {/* Map toolbar */}
          <div className="px-3 py-2.5 bg-[#111] border-b border-[#2a2520] flex items-center justify-between gap-2">
            <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">
              {location ? '📍 Location Pinned' : 'Click map to select'}
            </span>
            <DetectButton onDetect={setLocation} />
          </div>

          {/* Interactive Map */}
          <InteractiveMap onSelect={setLocation} selected={location} />

          {/* Below-map status bar */}
          <div className="px-4 py-2 bg-[#0d0d0d] border-t border-[#2a2520] flex items-center justify-between">
            <span className="text-[#8a8278] text-[10px]">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'No location selected'}
            </span>
            {location && (
              <button onClick={() => setLocation(null)} className="text-[#8a8278] hover:text-[#f5f0e8] text-[10px] tracking-widest uppercase transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Location detail panel (static map + link + WhatsApp) */}
        <AnimatePresence>
          {location && (
            <div className="mt-3">
              <LocationPanel location={location} onClear={() => setLocation(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Message */}
      <div>
        <label className={labelCls}><MessageSquare className="h-3 w-3 text-[#c8a45e]" /> Message (Optional)</label>
        <textarea value={form.message} onChange={upd('message')} placeholder="Any special requests..." rows={3} className={`${inputCls} resize-none`} />
      </div>

      {/* Summary */}
      {selectedPackage && (
        <div className="border border-[#c8a45e]/20 bg-[#c8a45e]/5 p-4">
          <p className="text-[10px] tracking-widest uppercase text-[#c8a45e] mb-2">Booking Summary</p>
          <div className="flex justify-between items-center">
            <span className="text-[#f5f0e8]/70 text-sm">{selectedPackage.name} Package</span>
            <span className="text-[#c8a45e] font-bold">{formatCurrency(selectedPackage.price, selectedPackage.currency)}</span>
          </div>
          {location && (
            <div className="mt-2 pt-2 border-t border-[#c8a45e]/10 flex items-center gap-2">
              <MapPin className="h-3 w-3 text-[#c8a45e]" />
              <span className="text-[#8a8278] text-xs truncate">{location.address ?? mapsLink(location.lat, location.lng)}</span>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2 space-y-3">
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-[#c8a45e] text-black py-4 text-sm tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-[#d4b76a] transition-colors disabled:opacity-50">
          {isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            : <><Send className="h-4 w-4" /> Book via WhatsApp & Download Invoice</>
          }
        </button>
        <p className="text-center text-xs text-[#8a8278]">
          <FileText className="inline h-3 w-3 mr-1" />
          PDF invoice auto-generated and downloaded on submit
        </p>
      </div>
    </motion.form>
  )
}

/* ─── Export with Suspense (for useSearchParams) ─── */
export function BookingForm({ packages }: { packages: PackageOption[] }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-[#c8a45e] animate-spin" /></div>}>
      <BookingFormInner packages={packages} />
    </Suspense>
  )
}
