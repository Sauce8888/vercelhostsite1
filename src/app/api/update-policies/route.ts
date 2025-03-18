import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    
    // SQL query to update RLS policies
    const { error } = await adminClient.rpc('exec_sql', {
      query: `
        -- Drop the existing restrictive policy
        DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
        
        -- Create a new policy allowing anyone to view properties
        CREATE POLICY "Anyone can view properties" 
          ON properties FOR SELECT 
          USING (true);
      `
    });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      message: 'RLS policies updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating RLS policies:', error);
    return NextResponse.json(
      { error: 'Failed to update RLS policies' }, 
      { status: 500 }
    );
  }
} 