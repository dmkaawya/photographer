// Type augmentation for Google Maps SDK loaded via script tag
// This avoids needing @types/google.maps as a peer dependency
// while still providing basic type safety.

declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions)
      addListener(event: string, handler: (e: MapMouseEvent) => void): void
      setZoom(zoom: number): void
      panTo(latLng: { lat: number; lng: number }): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }

    class Marker {
      constructor(options?: MarkerOptions)
      setMap(map: Map | null): void
    }

    class Geocoder {
      geocode(
        request: { location: { lat: number; lng: number } },
        callback: (results: GeocoderResult[] | null, status: string) => void
      ): void
    }

    namespace marker {
      class AdvancedMarkerElement {
        constructor(options?: AdvancedMarkerElementOptions)
        map: Map | null
      }

      interface AdvancedMarkerElementOptions {
        map?: Map
        position?: { lat: number; lng: number }
        content?: HTMLElement
      }
    }

    const Animation: {
      DROP: number
      BOUNCE: number
    }

    const SymbolPath: {
      CIRCLE: number
      FORWARD_CLOSED_ARROW: number
      BACKWARD_CLOSED_ARROW: number
    }

    interface MapOptions {
      center?: { lat: number; lng: number }
      zoom?: number
      disableDefaultUI?: boolean
      zoomControl?: boolean
      mapTypeControl?: boolean
      streetViewControl?: boolean
      fullscreenControl?: boolean
      gestureHandling?: string
      mapId?: string
      styles?: MapTypeStyle[]
    }

    interface MarkerOptions {
      position?: { lat: number; lng: number }
      map?: Map
      icon?: Symbol | string
      animation?: number
    }

    interface Symbol {
      path: number | string
      scale?: number
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
    }

    interface MapTypeStyle {
      elementType?: string
      featureType?: string
      stylers?: object[]
    }

    interface MapMouseEvent {
      latLng: LatLng | null
    }

    interface GeocoderResult {
      formatted_address: string
    }
  }
}

export {}
