import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { format, differenceInDays } from 'date-fns';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, checkIn, checkOut, adults, children, guestInfo } = body;
    
    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !adults || !guestInfo?.name || !guestInfo?.email) {
      return NextResponse.json({ error: 'Missing required booking information' }, { status: 400 });
    }
    
    // Check if dates are available
    const supabase = await createClient();
    
    // Get property information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
      
    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Check calendar availability
    const { data: calendarData, error: calendarError } = await supabase
      .from('calendar')
      .select('date, status')
      .eq('property_id', propertyId)
      .eq('status', 'booked')
      .gte('date', checkIn)
      .lt('date', checkOut);
      
    if (calendarError) {
      return NextResponse.json({ error: 'Could not check availability' }, { status: 500 });
    }
    
    // If any date is already booked, return error
    if (calendarData && calendarData.length > 0) {
      return NextResponse.json({ 
        error: 'Some dates are not available', 
        dates: calendarData.map(item => item.date) 
      }, { status: 400 });
    }
    
    // Calculate total price
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    
    // Get custom pricing if available
    const { data: pricing, error: pricingError } = await supabase
      .from('calendar')
      .select('date, price')
      .eq('property_id', propertyId)
      .gte('date', checkIn)
      .lt('date', checkOut);
      
    if (pricingError) {
      return NextResponse.json({ error: 'Could not get pricing information' }, { status: 500 });
    }
    
    // Calculate total price using custom pricing where available
    let totalPrice = 0;
    const checkInDate = new Date(checkIn);
    
    // Create a map of dates to prices for quick lookup
    const priceMap: Record<string, number> = {};
    if (pricing) {
      pricing.forEach(item => {
        if (item.price) {
          priceMap[item.date] = parseFloat(item.price);
        }
      });
    }
    
    // Calculate price for each night
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Use custom price if available, otherwise use base price
      const nightPrice = priceMap[dateStr] || parseFloat(property.base_price);
      totalPrice += nightPrice;
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${property.name}`,
              description: `${nights} night${nights > 1 ? 's' : ''} from ${format(new Date(checkIn), 'PPP')} to ${format(new Date(checkOut), 'PPP')}`,
            },
            unit_amount: Math.round(totalPrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}?canceled=true`,
      metadata: {
        propertyId,
        checkIn,
        checkOut,
        adults,
        children: children || 0,
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        totalPrice,
      },
    });
    
    // Return the session ID to redirect to Stripe Checkout
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 