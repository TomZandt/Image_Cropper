// src/components/ImageCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { useImageStore } from '../stores/imageStore';
import { Crop, ImageFile } from '../types';

const ImageCanvas: React.FC = () => {
  const { images, currentImageIndex, updateImageCropData } = useImageStore();
  const imageFile: ImageFile | undefined =
    currentImageIndex !== null ? images[currentImageIndex] : undefined;

  const [image] = useImage(imageFile?.thumbnail || ''); // Use thumbnail for display
  const [cropRect, setCropRect] = useState<Crop | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (imageFile && image) {
      const activeVersion = imageFile.data.versions.find(
        (v) => v.id === imageFile.data.activeVersionId
      );
      if (activeVersion) {
        setCropRect(activeVersion.crop);
      } else {
        // Default crop to full image if no active version or crop data
        setCropRect({ x: 0, y: 0, width: image.width, height: image.height });
      }
    } else {
      setCropRect(null);
    }
  }, [imageFile, image]);

  useEffect(() => {
    if (trRef.current && imageRef.current && cropRect) {
      trRef.current.nodes([imageRef.current]);
      const layer = trRef.current.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
  }, [cropRect]);

  const handleTransformEnd = () => {
    if (imageRef.current && imageFile) {
      const node = imageRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Transformer will scale the rect, so we need to get the absolute position and size
      const newCrop = {
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        height: node.height() * scaleY,
      };

      setCropRect(newCrop);

      // Update the store
      const updatedVersions = imageFile.data.versions.map((v) =>
        v.id === imageFile.data.activeVersionId
          ? { ...v, crop: newCrop }
          : v
      );
      updateImageCropData(imageFile.path, {
        ...imageFile.data,
        versions: updatedVersions,
      });
    }
  };

  return (
    <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
      {!imageFile || !image ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select an image to start cropping.
        </div>
      ) : (
        <Stage width={800} height={600}> {/* Fixed size for now, can be dynamic */}
          <Layer>
            <Image
              image={image}
              x={0}
              y={0}
              width={image.width}
              height={image.height}
              ref={imageRef}
              draggable
              onTransformEnd={handleTransformEnd}
            />
            {cropRect && (
              <Rect
                x={cropRect.x}
                y={cropRect.y}
                width={cropRect.width}
                height={cropRect.height}
                stroke="red"
                strokeWidth={2}
                dash={[10, 5]}
              />
            )}
            {cropRect && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit transformer to image bounds
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default ImageCanvas;
