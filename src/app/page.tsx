import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Image from 'next/image';
import { Calendar } from 'lucide-react';
import BookingWidget from '@/components/BookingWidget';
import PropertyGallery from '@/components/PropertyGallery';
import AmenitiesList from '@/components/AmenitiesList';
import HostInfo from '@/components/HostInfo';
import LocationMap from '@/components/LocationMap';

// This ensures the page always gets the latest data
export const revalidate = 3600; // Revalidate every hour

export default async function PropertyPage() {
  // Get the property ID from environment variable
  const propertyId = process.env.NEXT_PUBLIC_PROPERTY_ID;
  
  // Create a Supabase client for server components
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // Add options to bypass RLS for service_role access
  // This will allow us to fetch the property even with restricted RLS
  const { data: property, error } = await adminClient
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();
  
  console.log('Property fetch attempt:', { propertyId, error: error ? error.message : null });
  
  if (error) {
    console.error('Error fetching property:', error);
    return <div>Error loading property information. Please try again later.</div>;
  }
  
  if (!property) {
    return <div>Property not found.</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Property Name */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{property.name}</h1>
      
      {/* Property Gallery */}
      <PropertyGallery images={property.images} />
      
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Property Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
            <div className="prose max-w-none">
              <p>{property.description}</p>
            </div>
          </section>
          
          {/* Amenities */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">What this place offers</h2>
            <AmenitiesList amenities={property.amenities} />
          </section>
          
          {/* Location */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <p className="mb-4">{property.location}</p>
            <LocationMap location={property.location} />
          </section>
          
          {/* Host Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">About your host</h2>
            <HostInfo propertyId={property.id} />
          </section>
        </div>
        
        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingWidget 
              propertyId={property.id} 
              basePrice={property.base_price} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
