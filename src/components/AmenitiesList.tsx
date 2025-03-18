'use client';

import {
  Wifi,
  Utensils,
  Car,
  Tv,
  Bath,
  Wind,
  Snowflake,
  Waves,
  Dumbbell,
  Coffee,
  Webcam,
  KeyRound,
  PawPrint,
  ParkingCircle,
  Sun,
  Droplets,
  LucideIcon
} from 'lucide-react';

interface AmenitiesListProps {
  amenities: string[];
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (!amenities || amenities.length === 0) {
    return <p>No amenities listed.</p>;
  }

  // Map common amenity names to icons
  const amenityIcons: Record<string, LucideIcon> = {
    wifi: Wifi,
    kitchen: Utensils,
    parking: Car,
    tv: Tv,
    'private bathroom': Bath,
    'air conditioning': Wind,
    'heating system': Snowflake,
    pool: Waves,
    gym: Dumbbell,
    breakfast: Coffee,
    'security cameras': Webcam,
    'self check-in': KeyRound,
    'pet friendly': PawPrint,
    'free parking': ParkingCircle,
    'outdoor space': Sun,
    'hot tub': Droplets,
  };

  // Function to get the icon component for a given amenity
  const getIconForAmenity = (amenity: string): LucideIcon => {
    const normalizedAmenity = amenity.toLowerCase();
    
    // Check for exact matches
    if (amenityIcons[normalizedAmenity]) {
      return amenityIcons[normalizedAmenity];
    }
    
    // Check for partial matches
    for (const [key, icon] of Object.entries(amenityIcons)) {
      if (normalizedAmenity.includes(key)) {
        return icon;
      }
    }
    
    // Default icon if no match is found
    return Coffee;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {amenities.map((amenity, index) => {
        const IconComponent = getIconForAmenity(amenity);
        
        return (
          <div 
            key={index}
            className="flex items-center gap-3"
          >
            <IconComponent className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <span>{amenity}</span>
          </div>
        );
      })}
    </div>
  );
} 