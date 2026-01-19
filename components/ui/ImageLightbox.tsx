
import React from 'react';
import { X } from 'lucide-react';

export const ImageLightbox = ({ src, onClose }: { src: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      <div className="max-w-full max-h-full overflow-auto rounded-lg shadow-2xl">
        <img src={src} className="max-h-[90vh] object-contain" alt="Full Preview" />
      </div>
    </div>
  );
};
