-- Users table is automatically created by Supabase Auth
-- We'll extend it with additional fields

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own properties" 
  ON properties FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own properties" 
  ON properties FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own properties" 
  ON properties FOR UPDATE 
  USING (owner_id = auth.uid());

-- Calendar table for availability and pricing
CREATE TABLE calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'blocked', 'booked')),
  price DECIMAL(10, 2),
  minimum_stay INTEGER,
  booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- Enable Row Level Security
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view calendar" 
  ON calendar FOR SELECT 
  USING (true);

CREATE POLICY "Property owners can update calendar" 
  ON calendar FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = calendar.property_id 
    AND properties.owner_id = auth.uid()
  ));

CREATE POLICY "Property owners can insert calendar" 
  ON calendar FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = calendar.property_id 
    AND properties.owner_id = auth.uid()
  ));

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Property owners can view bookings" 
  ON bookings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = bookings.property_id 
    AND properties.owner_id = auth.uid()
  ));

-- Create function to update availability when booking is created
CREATE OR REPLACE FUNCTION update_calendar_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  curr_date DATE;
BEGIN
  -- Loop through all dates in the booking
  curr_date := NEW.check_in;
  WHILE curr_date < NEW.check_out LOOP
    -- Update or insert calendar entry
    INSERT INTO calendar (property_id, date, status, booking_id)
    VALUES (NEW.property_id, curr_date, 'booked', NEW.id)
    ON CONFLICT (property_id, date) 
    DO UPDATE SET status = 'booked', booking_id = NEW.id;
    
    -- Move to next day
    curr_date := curr_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update calendar when a booking is created
CREATE TRIGGER update_calendar_after_booking
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_calendar_on_booking();
