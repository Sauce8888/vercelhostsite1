'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface BookingWidgetProps {
  propertyId: string;
  basePrice: number;
}

export default function BookingWidget({ propertyId, basePrice }: BookingWidgetProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch availability when dates change
  useEffect(() => {
    if (date?.from && date?.to) {
      fetchAvailability();
      calculatePrice();
    }
  }, [date, propertyId]);

  const fetchAvailability = async () => {
    if (!date?.from || !date?.to) return;
    
    try {
      const startDate = format(date.from, 'yyyy-MM-dd');
      const endDate = format(date.to, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('calendar')
        .select('date, status, price')
        .eq('property_id', propertyId)
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      
      // Convert to a map for easy lookup
      const availabilityMap: Record<string, any> = {};
      data.forEach((item: any) => {
        availabilityMap[item.date] = item;
      });
      
      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Could not check availability');
    }
  };
  
  const calculatePrice = () => {
    if (!date?.from || !date?.to) return;
    
    const nights = differenceInDays(date.to, date.from);
    let total = 0;
    
    // Loop through each day and get the price (or use base price if not set)
    let currentDate = new Date(date.from);
    for (let i = 0; i < nights; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayPrice = availability[dateStr]?.price || basePrice;
      total += parseFloat(dayPrice);
      currentDate = addDays(currentDate, 1);
    }
    
    setTotalPrice(total);
  };
  
  const handleBooking = async () => {
    if (!date?.from || !date?.to) {
      toast.error('Please select dates');
      return;
    }
    
    setLoading(true);
    
    try {
      // Redirect to the booking page with query parameters
      const searchParams = new URLSearchParams({
        checkIn: format(date.from, 'yyyy-MM-dd'),
        checkOut: format(date.to, 'yyyy-MM-dd'),
        adults: guests.adults.toString(),
        children: guests.children.toString(),
        propertyId,
      });
      
      window.location.href = `/booking?${searchParams.toString()}`;
    } catch (error) {
      console.error('Error starting booking:', error);
      toast.error('Could not start booking process');
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>${basePrice} / night</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Dates</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              type="number"
              min={1}
              value={guests.adults}
              onChange={(e) => setGuests({...guests, adults: parseInt(e.target.value) || 1})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min={0}
              value={guests.children}
              onChange={(e) => setGuests({...guests, children: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        
        {date?.from && date?.to && (
          <div className="pt-4 border-t">
            <div className="flex justify-between">
              <span>Total ({differenceInDays(date.to, date.from)} nights)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleBooking} disabled={loading}>
          {loading ? 'Processing...' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  );
} 