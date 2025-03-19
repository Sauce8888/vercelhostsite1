import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { addDays, format, differenceInDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || process.env.NEXT_PUBLIC_PROPERTY_ID;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Missing property ID' }, { status: 400 });
    }
    
    // Get dates for the next 3 months if no date range specified
    const today = new Date();
    const from = startDate ? new Date(startDate) : today;
    const to = endDate ? new Date(endDate) : addDays(today, 90);
    
    const supabase = await createClient();
    
    // Get property information for base price
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('base_price')
      .eq('id', propertyId)
      .single();
      
    if (propertyError) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Get availability information
    const { data: availability, error: availabilityError } = await supabase
      .from('calendar')
      .select('date, status, price')
      .eq('property_id', propertyId)
      .gte('date', format(from, 'yyyy-MM-dd'))
      .lte('date', format(to, 'yyyy-MM-dd'));
      
    if (availabilityError) {
      return NextResponse.json({ error: 'Could not fetch availability' }, { status: 500 });
    }
    
    // Format the dates as an object for easier frontend use
    const availabilityMap: Record<string, { available: boolean; price: number }> = {};
    
    // Start with all dates in the range, setting default values
    let currentDate = new Date(from);
    const range = differenceInDays(to, from);
    
    for (let i = 0; i <= range; i++) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      availabilityMap[dateString] = {
        available: true,
        price: parseFloat(property.base_price)
      };
      currentDate = addDays(currentDate, 1);
    }
    
    // Override with data from the database
    availability.forEach((day) => {
      availabilityMap[day.date] = {
        available: day.status !== 'booked' && day.status !== 'blocked',
        price: day.price ? parseFloat(day.price) : parseFloat(property.base_price)
      };
    });
    
    return NextResponse.json({ 
      property_id: propertyId,
      dates: availabilityMap,
      base_price: parseFloat(property.base_price)
    });
  } catch (error: Error | unknown) {
    console.error('Error checking availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 