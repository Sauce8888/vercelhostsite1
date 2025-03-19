import Link from 'next/link';

export default function SetupPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Setup Your Host Site</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1. Update RLS Policies</h2>
          <p className="mb-4">Update Row Level Security policies to allow anonymous access to property data.</p>
          <a 
            href="/api/update-policies" 
            target="_blank" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Update Policies
          </a>
        </div>
        
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. Create Demo Property</h2>
          <p className="mb-4">Create a sample property with the ID specified in your .env file.</p>
          <a 
            href="/api/setup" 
            target="_blank" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Create Property
          </a>
        </div>
        
        <div className="p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. View Your Host Site</h2>
          <p className="mb-4">After completing steps 1-2, check out your host site.</p>
          <Link 
            href="/" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Go to Host Site
          </Link>
        </div>
      </div>
    </div>
  );
} 