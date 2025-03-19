import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// This needs to be disabled for Stripe webhooks
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: `Webhook signature verification failed: ${errorMessage}` }, { status: 400 });
    }
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create the booking in the database
      await createBooking(session);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: Error | unknown) {
    console.error('Stripe webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

interface BookingMetadata {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  guestName: string;
  guestEmail: string;
  totalPrice: string;
}

async function createBooking(session: Stripe.Checkout.Session) {
  const supabase = await createClient();
  
  // Extract booking details from session metadata
  const {
    propertyId,
    checkIn,
    checkOut,
    adults,
    children,
    guestName,
    guestEmail,
    totalPrice,
  } = (session.metadata as unknown) as BookingMetadata;
  
  // Create booking in the database
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      property_id: propertyId,
      guest_name: guestName,
      guest_email: guestEmail,
      check_in: checkIn,
      check_out: checkOut,
      adults: parseInt(adults),
      children: parseInt(children),
      total_price: parseFloat(totalPrice),
      status: 'confirmed',
      stripe_session_id: session.id,
    })
    .select();
    
  if (error) {
    console.error('Error creating booking:', error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }
  
  // The calendar dates will be updated automatically by the trigger we set up in the database
  
  return data;
} 