// src/components/ImageList.tsx
import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { ImageFile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const ImageList: React.FC = () => {
  const { images, currentImageIndex, setCurrentImageIndex } = useImageStore();

  return (
    <Card className="w-64 overflow-y-auto">
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <p className="text-muted-foreground">No images loaded.</p>
        ) : (
          <div className="space-y-2">
            {images.map((image: ImageFile, index: number) => (
              <div
                key={image.path}
                className={`cursor-pointer p-2 rounded-md flex items-center space-x-2 ${
                  index === currentImageIndex ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                {image.thumbnail && (
                  <img src={image.thumbnail} alt={image.name} className="w-10 h-10 object-cover rounded" />
                )}
                <span className="text-sm truncate">{image.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageList;
