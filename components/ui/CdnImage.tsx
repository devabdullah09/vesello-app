'use client';
import Image from 'next/image';
import { useState } from 'react';

interface CdnImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  style?: React.CSSProperties;
}

export default function CdnImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  style,
  ...props
}: CdnImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the image is from our CDN
  const isCdnImage = src.includes('myveselloapp1.b-cdn.net') || src.includes('cdn.vesello.net');
  
  // Fallback image
  const fallbackSrc = '/images/placeholder.jpg';

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If it's a CDN image and we have an error, use fallback
  const imageSrc = (isCdnImage && imageError) ? fallbackSrc : src;

  // For CDN images, use unoptimized to prevent 500 errors
  if (isCdnImage) {
    return (
      <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          style={fill ? { width: '100%', height: '100%', objectFit: 'cover', ...style } : style}
          {...props}
        />
      </div>
    );
  }

  // For non-CDN images, use Next.js Image optimization
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={handleError}
      onLoad={handleLoad}
      style={style}
      {...props}
    />
  );
}
