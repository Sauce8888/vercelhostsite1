'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  location: string;
}

export default function LocationMap({ location }: LocationMapProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // This is a simplified example. In a real application, you would:
    // 1. Geocode the address to get coordinates
    // 2. Use a mapping service like Google Maps, Mapbox, or Leaflet
    
    // For this demo, we'll create a static Google Maps URL
    // In a real app, you would want to handle this server-side or use API keys properly
    const encodedLocation = encodeURIComponent(location);
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedLocation}&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C${encodedLocation}&key=YOUR_API_KEY`;
    
    // Set a placeholder URL for demo purposes
    setMapUrl('/map-placeholder.jpg');
    
    // In a real application with API key:
    // setMapUrl(staticMapUrl);
  }, [location]);
  
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {mapUrl ? (
        <div className="relative aspect-[16/9] w-full bg-muted">
          {/* In a real app, this would be an actual map */}
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{location}</p>
              <p className="text-sm text-muted-foreground mt-2">Map display is a placeholder in this demo</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
} 