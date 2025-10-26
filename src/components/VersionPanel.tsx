// src/components/VersionPanel.tsx
import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { CropVersion, Crop, ExportSettings } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

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
    <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-white mb-4">Versions</h2>
      <button
        onClick={handleAddVersion}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        disabled={!currentImage}
      >
        Add New Version
      </button>

      {currentImage ? (
        <div className="space-y-2">
          {currentImage.data.versions.map((version) => (
            <div
              key={version.id}
              className={`p-2 rounded-md flex justify-between items-center ${
                version.id === activeVersion?.id ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <span className="text-white text-sm">{version.name} ({version.aspect})</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSetActiveVersion(version.id)}
                  className="text-xs bg-gray-500 hover:bg-gray-400 text-white py-1 px-2 rounded"
                  disabled={version.id === activeVersion?.id}
                >
                  Activate
                </button>
                <button
                  onClick={() => handleDeleteVersion(version.id)}
                  className="text-xs bg-red-500 hover:bg-red-400 text-white py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No image selected.</p>
      )}

      {activeVersion && (
        <div className="mt-6 p-4 bg-gray-700 rounded-md">
          <h3 className="text-md font-semibold text-white mb-2">Active Version Settings</h3>
          <p className="text-gray-300">Name: {activeVersion.name}</p>
          <p className="text-gray-300">Aspect: {activeVersion.aspect}</p>
          <p className="text-gray-300">Crop: ({activeVersion.crop.x}, {activeVersion.crop.y}, {activeVersion.crop.width}, {activeVersion.crop.height})</p>
          <p className="text-gray-300">Export Long Edge: {activeVersion.export.long_edge}</p>
          <p className="text-gray-300">JPEG Quality: {activeVersion.export.jpeg_quality}</p>
          {/* More detailed controls for editing crop and export settings would go here */}
        </div>
      )}
    </div>
  );
};

export default VersionPanel;
