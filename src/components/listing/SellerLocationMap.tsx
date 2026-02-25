import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SellerLocationMapProps {
  city: string | null;
  province: string | null;
  lat?: number | null;
  lng?: number | null;
  sellerName?: string | null;
}

export const SellerLocationMap = ({ city, province, lat, lng, sellerName }: SellerLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );

  const locationText = [city, province].filter(Boolean).join(', ') || 'Indonesia';

  // Geocode city/province if no lat/lng
  useEffect(() => {
    if (lat && lng) {
      setCoords({ lat, lng });
      setLoading(false);
      return;
    }

    const geocode = async () => {
      try {
        const query = encodeURIComponent(locationText);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          // Default to Indonesia center
          setCoords({ lat: -2.5, lng: 118.0 });
        }
      } catch {
        setCoords({ lat: -2.5, lng: 118.0 });
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [lat, lng, locationText]);

  // Initialize map
  useEffect(() => {
    if (!coords || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([coords.lat, coords.lng], lat && lng ? 15 : 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Custom marker with pulse
      const markerIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position:relative;width:40px;height:40px;">
            <div style="position:absolute;inset:0;background:hsl(var(--primary));border-radius:50%;opacity:0.2;animation:pulse 2s infinite;"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;background:hsl(var(--primary));border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([coords.lat, coords.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align:center;padding:4px;">
            <strong>${sellerName || 'Penjual'}</strong><br/>
            <span style="font-size:12px;color:#666;">${locationText}</span>
          </div>
        `);

      mapInstanceRef.current = map;

      // Force resize after render
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords]);

  const openInGoogleMaps = () => {
    if (coords) {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg border-2 hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            Lokasi Penjual
          </h4>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={openInGoogleMaps}>
            <ExternalLink className="h-3 w-3" />
            Google Maps
          </Button>
        </div>

        {/* Map */}
        <div className="relative">
          {loading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <div
              ref={mapRef}
              className="w-full h-48 z-0"
              style={{ minHeight: '192px' }}
            />
          )}
        </div>

        {/* Location text */}
        <div className="px-4 py-3 flex items-center gap-2 text-sm">
          <Navigation className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground truncate">{locationText}</span>
        </div>
      </CardContent>
    </Card>
  );
};
