'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shield, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface HostInfoProps {
  propertyId: string;
}

interface Host {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  joined_date: string;
  is_superhost: boolean;
  response_rate: number;
  response_time: string;
}

export default function HostInfo({ propertyId }: HostInfoProps) {
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHost = async () => {
      try {
        // First get the property to find the owner_id
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('owner_id')
          .eq('id', propertyId)
          .single();

        if (propertyError) throw propertyError;

        if (property) {
          // Then get the host information from the users table
          const { data: hostData, error: hostError } = await supabase
            .from('users')
            .select('id, name, bio, avatar_url, joined_date, is_superhost, response_rate, response_time')
            .eq('id', property.owner_id)
            .single();

          if (hostError) throw hostError;
          setHost(hostData);
        }
      } catch (error) {
        console.error('Error fetching host:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHost();
  }, [propertyId]);

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg"></div>;
  }

  if (!host) {
    return <div>Host information unavailable.</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden">
          <Image
            src={host.avatar_url || 'https://via.placeholder.com/150'}
            alt={host.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">{host.name}</h3>
          <p className="text-sm text-muted-foreground">
            Joined in {new Date(host.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          {host.is_superhost && (
            <div className="flex items-center mt-1 text-sm">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span>Superhost</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>4.9 Rating</span>
        </div>
        <div>
          <span>{host.response_rate}% Response rate</span>
        </div>
        <div>
          <span>Responds in {host.response_time}</span>
        </div>
      </div>

      <p className="text-sm">
        {host.bio}
      </p>
    </div>
  );
} 