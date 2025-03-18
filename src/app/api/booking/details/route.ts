import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Get booking information
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();
      
    if (error) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return NextResponse.json({ booking: data });
  } catch (error: any) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 