import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { supabase, type GalleryItem } from '../lib/supabase';

interface GalleryCarouselProps {
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  className?: string;
  imageClassName?: string;
  limit?: number;
}

const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  autoPlay = true,
  interval = 5000,
  showControls = true,
  className = '',
  imageClassName = '',
  limit = 10
}) => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRandomImages();
  }, []);

  useEffect(() => {
    if (autoPlay && !isHovered && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, images.length, isHovered]);

  const fetchRandomImages = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('gallery')
        .select('id, title, description, image_url, category, created_at, updated_at')
        .limit(limit);

      if (error) {
        console.error('Error fetching gallery images:', error);
        setError(`Database error: ${error.message}`);
      } else if (data && data.length > 0) {
        // Shuffle the array to get random images
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setImages(shuffled);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 ${className}`}>
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 ${className}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-red-600 p-6">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium mb-2">Error loading images</p>
          <p className="text-sm text-center">{error}</p>
          <button 
            onClick={fetchRandomImages}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-orange-100 ${className}`}>
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Display */}
      <div className="relative">
        <img
          src={images[currentIndex]?.image_url}
          alt={images[currentIndex]?.title}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${imageClassName}`}
          style={{ minHeight: '300px' }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">{images[currentIndex]?.title}</h3>
          {images[currentIndex]?.description && (
            <p className="text-white/90 text-sm">{images[currentIndex]?.description}</p>
          )}
          <div className="mt-2">
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
              {images[currentIndex]?.category}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Loading Indicator for Image Transitions */}
      <div className="absolute top-4 right-4">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default GalleryCarousel;