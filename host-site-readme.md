# Property Site (Guest-Facing)

This Next.js project powers individual property booking websites for hosts. Each site allows guests to view property details and make direct bookings.

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase
- **Payment Processing**: Stripe
- **UI Components**: 
  - shadcn/ui for consistent design
  - Lucide React for icons
  - Sonner for toast notifications

## Project Structure

```
├── app/
│   ├── api/         # API routes for bookings and availability
│   ├── booking/     # Booking flow pages
│   └── page.tsx     # Main property display page
├── components/      # Reusable UI components
├── lib/             # Utility functions and API clients
├── public/          # Static assets and images
└── styles/          # Global styles
```

## Key Components

### Property Display (Home Page)
- Hero section with property images carousel
- Property description
- Amenities list
- Location information with map
- Host information
- Booking widget/calendar
- Reviews section

### Booking Flow
- Date selection calendar
- Guest information form
- Pricing breakdown
- Payment processing via Stripe
- Confirmation page with booking details

### Availability Calendar
- Integration with Supabase calendar
- Real-time availability checking
- Price display for different dates

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Property Configuration
NEXT_PUBLIC_PROPERTY_ID=the_property_id_in_database

# Optional: For email notifications
EMAIL_SERVER=your_email_server
EMAIL_FROM=your_from_email
```

## API Routes

- `GET /api/availability`: Get available dates and pricing
- `POST /api/booking/create`: Create a new booking
- `GET /api/property`: Get property details
- `POST /api/webhook/stripe`: Handle Stripe payment webhooks

## Deployment on Vercel

1. Push code to a GitHub repository
2. Connect to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
