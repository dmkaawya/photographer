'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Copy, Check, MessageCircle, Eye, EyeOff,
  Navigation, Crosshair, ExternalLink, Map
} from 'lucide-react'

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface MapLocationSelectorProps {
  onLocationSelect?: (location: LocationData & { mapsLink: string }) => void
  whatsappNumber?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildMapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`
}

function buildStaticMapUrl(lat: number, lng: number, apiKey: string) {
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=15` +
    `&size=640x320` +
    `&scale=2` +
    `&maptype=roadmap` +
    `&style=element:geometry|color:0x1a1a1a` +
    `&style=element:labels.text.fill|color:0xc8a45e` +
    `&style=element:labels.text.stroke|color:0x0a0a0a` +
    `&style=feature:road|element:geometry|color:0x2a2520` +
    `&style=feature:water|element:geometry|color:0x0d1117` +
    `&style=feature:poi|visibility:off` +
    `&markers=color:0xc8a45e|${lat},${lng}` +
    `&key=${apiKey}`
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CoordBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2.5 bg-black/60 border border-gold/20 backdrop-blur-sm">
      <span className="text-[9px] tracking-[0.35em] uppercase text-gold/60">{label}</span>
      <span className="font-mono text-sm text-gold font-medium">{value}</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      title="Copy link"
      className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-widest uppercase bg-gold text-black hover:bg-amber-400 transition-colors font-medium shrink-0"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> Copied!
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function MapLocationSelector({
  onLocationSelect,
  whatsappNumber = '94771234567',
}: MapLocationSelectorProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null)

  const [location, setLocation] = useState<LocationData | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showStreetView, setShowStreetView] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [streetViewAvailable, setStreetViewAvailable] = useState(true)

  const mapsLink = location ? buildMapsLink(location.lat, location.lng) : ''
  const staticMapUrl = location && apiKey ? buildStaticMapUrl(location.lat, location.lng, apiKey) : ''

  // ── Load Google Maps SDK ──────────────────────────────────────────────────

  useEffect(() => {
    if (!apiKey) {
      setMapError('Google Maps API key missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local')
      return
    }
    if (typeof window !== 'undefined' && window.google?.maps) {
      initMap()
      return
    }
    if (document.querySelector('script[data-gm-script]')) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`
    script.async = true
    script.defer = true
    script.setAttribute('data-gm-script', 'true')
    script.onload = initMap
    script.onerror = () => setMapError('Failed to load Google Maps. Check your API key.')
    document.head.appendChild(script)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  // ── Initialise Map ────────────────────────────────────────────────────────

  const initMap = useCallback(() => {
    if (!mapRef.current || googleMapRef.current) return

    const defaultCenter = { lat: 6.9271, lng: 79.8612 } // Colombo

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'cooperative',
      mapId: 'sadeepa-luxury-map',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#c8a45e' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2520' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1510' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3028' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a6fa5' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
        { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3a3028' }] },
      ],
    })

    googleMapRef.current = map
    setMapLoaded(true)

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) placeMarker(e.latLng, map)
    })
  }, [])

  // ── Place / Move Marker ───────────────────────────────────────────────────

  const placeMarker = useCallback((latLng: google.maps.LatLng, map: google.maps.Map) => {
    if (markerRef.current) {
      if ('setMap' in markerRef.current) {
        (markerRef.current as google.maps.Marker).setMap(null)
      } else {
        (markerRef.current as google.maps.marker.AdvancedMarkerElement).map = null
      }
    }

    const lat = latLng.lat()
    const lng = latLng.lng()

    // Try AdvancedMarkerElement first, fall back to legacy Marker
    try {
      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width:36px;height:36px;
          background:#c8a45e;
          border:3px solid #0a0a0a;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 20px rgba(200,164,94,0.6);
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="transform:rotate(45deg);width:10px;height:10px;background:#0a0a0a;border-radius:50%"></div>
        </div>
      `
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: el,
      })
      markerRef.current = marker
    } catch {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#c8a45e',
          fillOpacity: 1,
          strokeColor: '#0a0a0a',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.DROP,
      })
      markerRef.current = marker
    }

    const loc: LocationData = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
    setLocation(loc)
    setShowStreetView(false)
    setStreetViewAvailable(true)
    map.panTo({ lat, lng })

    // Reverse geocode for address
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0].formatted_address
        setLocation(prev => prev ? { ...prev, address } : prev)
        onLocationSelect?.({ ...loc, address, mapsLink: buildMapsLink(lat, lng) })
      } else {
        onLocationSelect?.({ ...loc, mapsLink: buildMapsLink(lat, lng) })
      }
    })
  }, [onLocationSelect])

  // ── GPS: Use My Location ──────────────────────────────────────────────────

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        if (googleMapRef.current) {
          googleMapRef.current.setZoom(16)
          placeMarker(latLng, googleMapRef.current)
        }
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    )
  }, [placeMarker])

  // ── WhatsApp ──────────────────────────────────────────────────────────────

  const openWhatsApp = () => {
    if (!location) return
    const msg = encodeURIComponent(`📍 Event Location:\n${location.address ?? ''}\n${mapsLink}`)
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank')
  }

  // ── No API key fallback ───────────────────────────────────────────────────

  if (mapError) {
    return (
      <div className="border border-gold/20 bg-card p-8 text-center space-y-3">
        <Map className="h-10 w-10 text-gold/40 mx-auto" />
        <p className="text-sm text-muted-foreground">{mapError}</p>
        <p className="text-xs text-gold/60 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key</p>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Map Container ── */}
      <div className="relative group">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60 z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60 z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60 z-10 pointer-events-none" />

        {/* Loading shimmer */}
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 z-10 bg-[#1a1a1a] flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <Map className="h-10 w-10 text-gold/30" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Map className="h-10 w-10 text-gold" />
              </div>
            </div>
            <span className="text-xs tracking-[0.3em] uppercase text-gold/50">Loading Map…</span>
          </div>
        )}

        {/* The actual map div */}
        <div
          ref={mapRef}
          className="w-full h-80 sm:h-96"
          style={{ background: '#1a1a1a' }}
        />

        {/* GPS button overlay */}
        <button
          onClick={useMyLocation}
          disabled={isLocating || !mapLoaded}
          title="Use my current location"
          className="absolute bottom-4 right-4 z-10 bg-black/80 backdrop-blur-sm border border-gold/40 text-gold p-2.5 hover:bg-gold hover:text-black transition-all duration-200 disabled:opacity-50 shadow-lg"
        >
          {isLocating
            ? <Crosshair className="h-4 w-4 animate-spin" />
            : <Navigation className="h-4 w-4" />
          }
        </button>

        {/* Click hint */}
        {!location && mapLoaded && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm border border-gold/20 px-3 py-1.5">
            <p className="text-[10px] tracking-widest uppercase text-gold/70">Click map to select location</p>
          </div>
        )}
      </div>

      {/* ── Coordinates ── */}
      <AnimatePresence>
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-3 items-center"
          >
            <CoordBadge label="Latitude" value={location.lat.toFixed(6)} />
            <CoordBadge label="Longitude" value={location.lng.toFixed(6)} />
            {location.address && (
              <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-gold/10">
                <MapPin className="h-3.5 w-3.5 text-gold/50 shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{location.address}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Location Selected Panel ── */}
      <AnimatePresence>
        {location && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden space-y-4"
          >

            {/* Static Map Preview */}
            {staticMapUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="relative overflow-hidden border border-gold/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              >
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/80 to-transparent">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-gold/70">Location Preview</span>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-gold/60 hover:text-gold transition-colors"
                  >
                    Open in Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={staticMapUrl}
                  alt="Static map preview"
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            )}

            {/* Maps Link Generator */}
            <div>
              <label className="flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-2">
                <MapPin className="h-3 w-3" /> Shareable Google Maps Link
              </label>
              <div className="flex items-stretch gap-0 border border-gold/20 overflow-hidden">
                <input
                  readOnly
                  value={mapsLink}
                  className="flex-1 bg-black/60 text-muted-foreground text-xs px-3 py-2.5 font-mono focus:outline-none truncate"
                />
                <CopyButton text={mapsLink} />
              </div>
            </div>

            {/* Street View Toggle */}
            <div>
              <button
                onClick={() => setShowStreetView(v => !v)}
                className={`flex items-center gap-2 text-xs tracking-[0.2em] uppercase px-4 py-2.5 border transition-all duration-200 ${
                  showStreetView
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gold/20 text-muted-foreground hover:border-gold/50 hover:text-gold/70'
                }`}
              >
                {showStreetView ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showStreetView ? 'Hide' : 'Show'} Street View
              </button>

              <AnimatePresence>
                {showStreetView && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mt-3 overflow-hidden border border-gold/20"
                  >
                    {streetViewAvailable ? (
                      <iframe
                        title="Street View"
                        width="100%"
                        height="280"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=90`}
                        className="block"
                        onError={() => setStreetViewAvailable(false)}
                      />
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center gap-2 bg-black/40 text-muted-foreground">
                        <Eye className="h-8 w-8 opacity-20" />
                        <p className="text-xs">Street View not available for this location</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* WhatsApp Send Button */}
            <motion.button
              onClick={openWhatsApp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#25D366]/20 hover:border-[#25D366]/60 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              Send Location via WhatsApp
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
