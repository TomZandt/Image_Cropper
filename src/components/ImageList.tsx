// src/components/ImageList.tsx
import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { ImageFile } from '../types';

const ImageList: React.FC = () => {
  const { images, currentImageIndex, setCurrentImageIndex } = useImageStore();

  return (
    <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-white mb-4">Images</h2>
      {images.length === 0 ? (
        <p className="text-gray-400">No images loaded.</p>
      ) : (
        <div className="space-y-2">
          {images.map((image: ImageFile, index: number) => (
            <div
              key={image.path}
              className={`cursor-pointer p-2 rounded-md flex items-center space-x-2 ${
                index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              {image.thumbnail && (
                <img src={image.thumbnail} alt={image.name} className="w-10 h-10 object-cover rounded" />
              )}
              <span className="text-white text-sm truncate">{image.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageList;
