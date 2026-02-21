'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Copy, Check, MessageCircle, Eye, EyeOff,
  Navigation, ExternalLink, Crosshair, Map, Loader2
} from 'lucide-react'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface SelectedLocation {
  lat: number
  lng: number
  address?: string
}

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const COLOMBO = { lat: 6.9271, lng: 79.8612 }
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '94771234567'
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
}

function staticMapUrl(lat: number, lng: number, w = 600, h = 300) {
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}&zoom=15&size=${w}x${h}` +
    `&maptype=roadmap` +
    `&markers=color:0xc8a45e%7C${lat},${lng}` +
    `&style=element:geometry%7Ccolor:0x1a1a1a` +
    `&style=element:labels.text.fill%7Ccolor:0xc8a45e` +
    `&style=element:labels.text.stroke%7Ccolor:0x0a0a0a` +
    `&style=feature:road%7Celement:geometry%7Ccolor:0x2a2520` +
    `&style=feature:water%7Ccolor:0x0d1117` +
    `&key=${MAPS_API_KEY}`
  )
}

function streetViewUrl(lat: number, lng: number) {
  return (
    `https://www.google.com/maps/embed/v1/streetview` +
    `?key=${MAPS_API_KEY}` +
    `&location=${lat},${lng}` +
    `&heading=210&pitch=10&fov=90`
  )
}

/* ─────────────────────────────────────────────
   GOLD DIVIDER
───────────────────────────────────────────── */
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c8a45e]/40" />
      <div className="w-1 h-1 rotate-45 bg-[#c8a45e]/60" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c8a45e]/40" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#c8a45e]/30 text-[#c8a45e] text-xs tracking-widest uppercase hover:bg-[#c8a45e] hover:text-black transition-all duration-200"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Copied
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
            <Copy className="h-3 w-3" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ─────────────────────────────────────────────
   INTERACTIVE MAP (uses Google Maps JS API)
───────────────────────────────────────────── */
function InteractiveMap({
  onLocationSelect,
  selected,
}: {
  onLocationSelect: (loc: SelectedLocation) => void
  selected: SelectedLocation | null
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return

    const map = new window.google.maps.Map(mapRef.current, {
      center: COLOMBO,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#c8a45e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1510' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3020' }] },
        { featureType: 'water', stylers: [{ color: '#0d1117' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8a7a52' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f1f1f' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8a45e' }, { weight: 0.5 }] },
        { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#8a7a52' }] },
      ],
    })

    googleMapRef.current = map

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      placeMarker(lat, lng, map)
      onLocationSelect({ lat, lng })

      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onLocationSelect({ lat, lng, address: results[0].formatted_address })
        }
      })
    })

    setLoading(false)
  }, [onLocationSelect])

  function placeMarker(lat: number, lng: number, map: google.maps.Map) {
    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#c8a45e',
        fillOpacity: 1,
        strokeColor: '#0a0a0a',
        strokeWeight: 3,
      },
      animation: window.google.maps.Animation.DROP,
    })
  }

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.google?.maps) {
      initMap()
      return
    }

    if (!MAPS_API_KEY) {
      setError(true)
      setLoading(false)
      return
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      existingScript.addEventListener('load', initMap)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = initMap
    script.onerror = () => { setError(true); setLoading(false) }
    document.head.appendChild(script)
  }, [initMap])

  // Pan to selected location from outside
  useEffect(() => {
    if (selected && googleMapRef.current) {
      googleMapRef.current.panTo({ lat: selected.lat, lng: selected.lng })
      placeMarker(selected.lat, selected.lng, googleMapRef.current)
    }
  }, [selected])

  if (error) {
    return (
      <div className="w-full h-[400px] bg-[#111] border border-[#c8a45e]/20 flex flex-col items-center justify-center gap-4 text-center px-6">
        <MapPin className="h-10 w-10 text-[#c8a45e]/40" />
        <div>
          <p className="text-[#f5f0e8]/60 text-sm">Google Maps API key not configured</p>
          <p className="text-[#8a8278] text-xs mt-1">Add <code className="text-[#c8a45e]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env.local</p>
        </div>
        <DemoMapFallback onLocationSelect={onLocationSelect} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden border border-[#c8a45e]/20">
      {loading && (
        <div className="absolute inset-0 bg-[#111] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[#c8a45e] animate-spin" />
            <span className="text-[#8a8278] text-xs tracking-widest uppercase">Loading Map</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {/* Crosshair overlay hint */}
      {!loading && !selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm border border-[#c8a45e]/30 px-4 py-2 flex items-center gap-2 pointer-events-none"
        >
          <Crosshair className="h-3.5 w-3.5 text-[#c8a45e]" />
          <span className="text-[#f5f0e8]/70 text-xs tracking-widest uppercase">Click to pin location</span>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   DEMO MAP FALLBACK (when no API key)
   Allows manual lat/lng entry
───────────────────────────────────────────── */
function DemoMapFallback({ onLocationSelect }: { onLocationSelect: (loc: SelectedLocation) => void }) {
  const [lat, setLat] = useState('6.9271')
  const [lng, setLng] = useState('79.8612')

  const apply = () => {
    const latN = parseFloat(lat)
    const lngN = parseFloat(lng)
    if (!isNaN(latN) && !isNaN(lngN)) {
      onLocationSelect({ lat: latN, lng: lngN })
    }
  }

  return (
    <div className="w-full mt-4 border border-[#c8a45e]/20 bg-[#0a0a0a] p-4">
      <p className="text-[#c8a45e] text-xs tracking-widest uppercase mb-3">Enter Coordinates Manually</p>
      <div className="flex gap-2">
        <input
          value={lat}
          onChange={e => setLat(e.target.value)}
          placeholder="Latitude"
          className="flex-1 bg-[#111] border border-[#2a2520] text-[#f5f0e8] px-3 py-2 text-sm focus:outline-none focus:border-[#c8a45e] transition-colors"
        />
        <input
          value={lng}
          onChange={e => setLng(e.target.value)}
          placeholder="Longitude"
          className="flex-1 bg-[#111] border border-[#2a2520] text-[#f5f0e8] px-3 py-2 text-sm focus:outline-none focus:border-[#c8a45e] transition-colors"
        />
        <button
          onClick={apply}
          className="bg-[#c8a45e] text-black px-4 py-2 text-xs tracking-widest uppercase font-medium hover:bg-[#d4b76a] transition-colors"
        >
          Set
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STATIC MAP PREVIEW
───────────────────────────────────────────── */
function StaticMapPreview({ location }: { location: SelectedLocation }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border border-[#c8a45e]/20 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
    >
      {/* Header */}
      <div className="bg-[#111] px-4 py-3 flex items-center justify-between border-b border-[#2a2520]">
        <div className="flex items-center gap-2">
          <Map className="h-3.5 w-3.5 text-[#c8a45e]" />
          <span className="text-[#c8a45e] text-xs tracking-[0.3em] uppercase">Location Preview</span>
        </div>
        <a
          href={mapsLink(location.lat, location.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[#8a8278] hover:text-[#c8a45e] transition-colors text-xs"
        >
          Open Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Static map image */}
      <div className="relative bg-[#111] aspect-[2/1]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#c8a45e] animate-spin" />
          </div>
        )}
        {MAPS_API_KEY ? (
          <motion.img
            src={staticMapUrl(location.lat, location.lng)}
            alt="Location static map"
            className="w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-[#c8a45e] mx-auto mb-2" />
              <p className="text-[#c8a45e] font-mono text-sm">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
              {location.address && (
                <p className="text-[#8a8278] text-xs mt-1 max-w-[200px] mx-auto">{location.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Gold pin overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-3 bg-[#c8a45e]/20 rounded-full blur-md animate-pulse" />
            <div className="relative w-3 h-3 bg-[#c8a45e] rounded-full border-2 border-black shadow-lg" />
          </div>
        </div>
      </div>

      {/* Coordinates bar */}
      <div className="bg-[#0d0d0d] px-4 py-2.5 flex items-center gap-4 border-t border-[#2a2520]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">Lat</span>
          <span className="text-[#c8a45e] font-mono text-xs">{location.lat.toFixed(6)}</span>
        </div>
        <div className="w-px h-3 bg-[#2a2520]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">Lng</span>
          <span className="text-[#c8a45e] font-mono text-xs">{location.lng.toFixed(6)}</span>
        </div>
        {location.address && (
          <>
            <div className="w-px h-3 bg-[#2a2520]" />
            <p className="text-[#8a8278] text-[10px] truncate flex-1">{location.address}</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   STREET VIEW
───────────────────────────────────────────── */
function StreetViewPreview({ location }: { location: SelectedLocation }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border border-[#c8a45e]/20"
    >
      <div className="bg-[#111] px-4 py-3 border-b border-[#2a2520] flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-[#c8a45e]" />
        <span className="text-[#c8a45e] text-xs tracking-[0.3em] uppercase">Street View</span>
      </div>
      {MAPS_API_KEY ? (
        <iframe
          src={streetViewUrl(location.lat, location.lng)}
          className="w-full h-64 border-0"
          title="Street View"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-64 bg-[#111] flex items-center justify-center">
          <div className="text-center">
            <Eye className="h-8 w-8 text-[#c8a45e]/40 mx-auto mb-2" />
            <p className="text-[#8a8278] text-xs">Add API key to enable Street View</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   LINK PANEL
───────────────────────────────────────────── */
function LinkPanel({ location }: { location: SelectedLocation }) {
  const link = mapsLink(location.lat, location.lng)
  const waText = encodeURIComponent(`📍 Location: ${link}`)
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="border border-[#c8a45e]/20 bg-[#0d0d0d]"
    >
      <div className="px-4 py-3 border-b border-[#2a2520]">
        <span className="text-[#c8a45e] text-xs tracking-[0.3em] uppercase">Generated Link</span>
      </div>
      <div className="p-4 space-y-3">
        {/* Read-only link input */}
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 bg-[#111] border border-[#2a2520] text-[#f5f0e8]/70 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#c8a45e]/50 transition-colors truncate"
          />
          <CopyButton text={link} />
        </div>

        {/* WhatsApp button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-2.5 w-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#25D366] hover:text-black transition-all duration-300"
        >
          <MessageCircle className="h-4 w-4" />
          Send Location via WhatsApp
        </a>

        {/* Open in Maps */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-[#c8a45e]/20 text-[#c8a45e] py-3 text-xs tracking-widest uppercase hover:bg-[#c8a45e]/10 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </a>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   DETECT MY LOCATION button
───────────────────────────────────────────── */
function DetectLocationButton({ onDetect }: { onDetect: (loc: SelectedLocation) => void }) {
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  const detect = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    setDenied(false)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        onDetect({ lat, lng })
        setLoading(false)

        // Reverse geocode if API key available
        if (MAPS_API_KEY && window.google?.maps) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              onDetect({ lat, lng, address: results[0].formatted_address })
            }
          })
        }
      },
      () => { setLoading(false); setDenied(true) }
    )
  }

  return (
    <button
      onClick={detect}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 border border-[#c8a45e]/30 text-[#c8a45e] text-xs tracking-widest uppercase hover:bg-[#c8a45e] hover:text-black transition-all duration-200 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Navigation className="h-3.5 w-3.5" />
      )}
      {denied ? 'Access Denied' : 'Use My Location'}
    </button>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function LocationSelector({
  onLocationChange,
}: {
  onLocationChange?: (loc: SelectedLocation) => void
}) {
  const [selected, setSelected] = useState<SelectedLocation | null>(null)
  const [showStreetView, setShowStreetView] = useState(false)

  const handleSelect = useCallback((loc: SelectedLocation) => {
    setSelected(loc)
    onLocationChange?.(loc)
  }, [onLocationChange])

  return (
    <div
      className="w-full max-w-2xl mx-auto font-sans"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* Section Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-px bg-[#c8a45e]" />
          <span className="text-[10px] tracking-[0.5em] text-[#c8a45e] uppercase">Location Selector</span>
        </div>
        <h2 className="text-[#f5f0e8] text-2xl font-semibold tracking-tight">
          Select Event Location
        </h2>
        <p className="text-[#8a8278] text-sm mt-1">
          Click anywhere on the map to pin your location
        </p>
      </div>

      <GoldDivider />

      {/* Toolbar */}
      <div className="flex items-center justify-between py-3 gap-2 flex-wrap">
        <DetectLocationButton onDetect={handleSelect} />
        {selected && (
          <button
            onClick={() => setShowStreetView(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2520] text-[#8a8278] hover:text-[#c8a45e] hover:border-[#c8a45e]/30 text-xs tracking-widest uppercase transition-all duration-200"
          >
            {showStreetView ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showStreetView ? 'Hide' : 'Show'} Street View
          </button>
        )}
      </div>

      {/* Interactive Map */}
      <InteractiveMap onLocationSelect={handleSelect} selected={selected} />

      {/* Info bar below map */}
      <div className="bg-[#0d0d0d] border border-t-0 border-[#c8a45e]/10 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[#8a8278] text-[10px] tracking-widest uppercase">
          {selected ? 'Location selected' : 'No location selected'}
        </span>
        {selected && (
          <span className="text-[#c8a45e] font-mono text-[10px]">
            {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
          </span>
        )}
      </div>

      {/* Conditional sections */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="location-panels"
            className="mt-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Static map preview */}
            <StaticMapPreview location={selected} />

            {/* Street view */}
            <AnimatePresence>
              {showStreetView && <StreetViewPreview location={selected} />}
            </AnimatePresence>

            {/* Link panel */}
            <LinkPanel location={selected} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border border-dashed border-[#2a2520] p-8 flex flex-col items-center gap-3 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#c8a45e]/10 blur-xl rounded-full" />
              <MapPin className="relative h-10 w-10 text-[#c8a45e]/40" />
            </div>
            <div>
              <p className="text-[#f5f0e8]/40 text-sm">No location selected yet</p>
              <p className="text-[#8a8278] text-xs mt-1">Click on the map or use "Use My Location"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
