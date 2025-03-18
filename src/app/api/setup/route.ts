import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const propertyId = process.env.NEXT_PUBLIC_PROPERTY_ID;
    
    // First check if property already exists
    const { data: existingProperty } = await adminClient
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();
      
    if (existingProperty) {
      return NextResponse.json({ message: 'Property already exists', id: propertyId });
    }
    
    // Create a sample user if needed
    const { data: users } = await adminClient
      .from('auth.users')
      .select('id')
      .limit(1);
      
    let ownerId;
    
    if (users && users.length > 0) {
      ownerId = users[0].id;
    } else {
      // Create a dummy user with the auth API if no users exist
      const { data: newUser, error: userError } = await adminClient.auth.admin.createUser({
        email: 'demo@example.com',
        password: 'password123',
        email_confirm: true
      });
      
      if (userError) throw userError;
      ownerId = newUser.user.id;
    }
    
    // Insert property with the specified ID
    const { data, error } = await adminClient
      .from('properties')
      .insert({
        id: propertyId,
        owner_id: ownerId,
        name: 'Ocean View Villa',
        description: 'A beautiful villa with stunning ocean views, perfect for your vacation getaway.',
        location: 'Malibu, California',
        amenities: ['WiFi', 'Pool', 'Kitchen', 'Air conditioning', 'Beach access'],
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1562182384-08115de5ee97?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop'
        ],
        base_price: 299.99
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ 
      message: 'Property created successfully', 
      property: data 
    });
    
  } catch (error) {
    console.error('Error setting up property:', error);
    return NextResponse.json(
      { error: 'Failed to set up property' }, 
      { status: 500 }
    );
  }
} 