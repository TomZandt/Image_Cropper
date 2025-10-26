// src/components/VersionPanel.tsx
import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { CropVersion, Crop, ExportSettings } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const VersionPanel: React.FC = () => {
  const { images, currentImageIndex, addCropVersion, setActiveVersion, deleteCropVersion, updateCropVersion } = useImageStore();

  const currentImage = currentImageIndex !== null ? images[currentImageIndex] : undefined;
  const activeVersion = currentImage?.data.versions.find(
    (v) => v.id === currentImage.data.activeVersionId
  );

  const handleAddVersion = () => {
    if (currentImage) {
      const newVersionId = uuidv4();
      const defaultCrop: Crop = { x: 0, y: 0, width: 100, height: 100 }; // Placeholder
      const defaultExport: ExportSettings = { long_edge: 1080, jpeg_quality: 90 };
      const newVersion: CropVersion = {
        id: newVersionId,
        name: `Version ${currentImage.data.versions.length + 1}`,
        aspect: 'Freeform',
        crop: defaultCrop,
        export: defaultExport,
      };
      addCropVersion(currentImage.path, newVersion);
    }
  };

  const handleSetActiveVersion = (versionId: string) => {
    if (currentImage) {
      setActiveVersion(currentImage.path, versionId);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (currentImage) {
      deleteCropVersion(currentImage.path, versionId);
    }
  };

  // TODO: Implement UI for updating crop and export settings for active version

  return (
    <Card className="w-64 overflow-y-auto">
      <CardHeader>
        <CardTitle>Versions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleAddVersion}
          className="w-full mb-4"
          disabled={!currentImage}
        >
          Add New Version
        </Button>

        {currentImage ? (
          <div className="space-y-2">
            {currentImage.data.versions.map((version) => (
              <div
                key={version.id}
                className={`p-2 rounded-md flex justify-between items-center ${
                  version.id === activeVersion?.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                }`}
              >
                <span className="text-sm">{version.name} ({version.aspect})</span>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetActiveVersion(version.id)}
                    disabled={version.id === activeVersion?.id}
                  >
                    Activate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteVersion(version.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No image selected.</p>
        )}

        {activeVersion && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <h3 className="text-md font-semibold mb-2">Active Version Settings</h3>
            <p className="text-sm text-muted-foreground">Name: {activeVersion.name}</p>
            <p className="text-sm text-muted-foreground">Aspect: {activeVersion.aspect}</p>
            <p className="text-sm text-muted-foreground">Crop: ({activeVersion.crop.x}, {activeVersion.crop.y}, {activeVersion.crop.width}, {activeVersion.crop.height})</p>
            <p className="text-sm text-muted-foreground">Export Long Edge: {activeVersion.export.long_edge}</p>
            <p className="text-sm text-muted-foreground">JPEG Quality: {activeVersion.export.jpeg_quality}</p>
            {/* More detailed controls for editing crop and export settings would go here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionPanel;
