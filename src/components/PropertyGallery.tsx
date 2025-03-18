'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images are provided, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  return (
    <div 
      className="relative aspect-[16/9] w-full rounded-lg overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Property image gallery"
    >
      {images.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-300 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={src}
            alt={`Property image ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0}
          />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-primary' : 'bg-background/80'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 