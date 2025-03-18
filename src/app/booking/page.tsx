'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults');
  const children = searchParams.get('children');
  const propertyId = searchParams.get('propertyId');

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Calculate number of nights
  const nights = checkIn && checkOut 
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;

  useEffect(() => {
    // Validate required parameters
    if (!checkIn || !checkOut || !adults || !propertyId) {
      toast.error('Missing required booking information');
      return;
    }

    const fetchPropertyAndPrice = async () => {
      try {
        // Fetch property details
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        setProperty(data);

        // Calculate total price
        if (data && checkIn && checkOut) {
          const { data: calendarData } = await supabase
            .from('calendar')
            .select('date, price')
            .eq('property_id', propertyId)
            .gte('date', checkIn)
            .lt('date', checkOut);

          // Create a map of dates to prices
          const priceMap: Record<string, number> = {};
          if (calendarData) {
            calendarData.forEach(item => {
              if (item.price) {
                priceMap[item.date] = parseFloat(item.price);
              }
            });
          }

          // Calculate total price
          let total = 0;
          const startDate = new Date(checkIn);
          for (let i = 0; i < nights; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const nightPrice = priceMap[dateStr] || parseFloat(data.base_price);
            total += nightPrice;
          }

          setTotalPrice(total);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Could not load property information');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndPrice();
  }, [checkIn, checkOut, propertyId, adults, nights]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!guestInfo.name || !guestInfo.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Create booking
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          adults: parseInt(adults || '1'),
          children: parseInt(children || '0'),
          guestInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to process booking');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <p>The property you're trying to book could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/">Return to Property</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        className="mb-6" 
        asChild
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to property
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-2">Complete your booking</h1>
      <h2 className="text-xl mb-6">{property.name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
                <CardDescription>Please provide your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name*</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={guestInfo.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address*</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={guestInfo.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={guestInfo.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dates</p>
                  <p className="text-sm text-muted-foreground">
                    {checkIn && format(new Date(checkIn), 'MMM d, yyyy')} - {checkOut && format(new Date(checkOut), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-sm text-muted-foreground">
                    {adults} adult{parseInt(adults || '1') !== 1 ? 's' : ''}
                    {parseInt(children || '0') > 0 && `, ${children} child${parseInt(children || '0') !== 1 ? 'ren' : ''}`}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You won't be charged yet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 