
import React, { useState } from 'react';

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
}

export const FadeImage = ({ src, alt, className = "", ...props }: FadeImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Loader (Pulse) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-transparent animate-spin opacity-50"></div>
        </div>
      )}
      
      {/* Image with Scale Animation */}
      <img
        src={src}
        alt={alt || "Image"}
        onLoad={() => setIsLoaded(true)}
        className={`
            w-full h-full object-cover transition-all duration-500 ease-out
            ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        {...props}
      />
    </div>
  );
};
