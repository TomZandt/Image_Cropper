use tauri::{command, AppHandle};
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use anyhow::Result;

// Placeholder for ImageCropData structure, will be defined in types.ts and mirrored here
#[derive(Debug, Serialize, Deserialize)]
pub struct Crop {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportSettings {
    pub long_edge: u32,
    pub jpeg_quality: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CropVersion {
    pub id: String,
    pub name: String,
    pub aspect: String,
    pub crop: Crop,
    pub export: ExportSettings,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageCropData {
    pub versions: Vec<CropVersion>,
    pub active_version_id: String,
}


use std::fs;
use rayon::prelude::*; // Import for parallel iterators

#[command]
pub fn load_folder(_app_handle: AppHandle, path: PathBuf) -> Result<Vec<PathBuf>, String> {
    let mut image_paths = Vec::new();
    for entry in fs::read_dir(&path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();

        if entry_path.is_file() {
            if let Some(extension) = entry_path.extension() {
                if let Some(ext_str) = extension.to_str() {
                    if ["jpg", "jpeg", "png"].contains(&ext_str.to_lowercase().as_str()) {
                        image_paths.push(entry_path);
                    }
                }
            }
        }
    }
    Ok(image_paths)
}

#[command]
pub fn save_crop_data(path: PathBuf, data: ImageCropData) -> Result<(), String> {
    let json_path = path.with_extension("crop.json");
    let json_data = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize crop data: {}", e))?;

    fs::write(&json_path, json_data)
        .map_err(|e| format!("Failed to write crop data to file {:?}: {}", json_path, e))?;

    Ok(())
}

use super::image_processing; // Import the image_processing module

#[command]
pub fn export_versions(
    _app_handle: AppHandle,
    image_path: PathBuf,
    versions: Vec<CropVersion>,
    output_dir: PathBuf,
) -> Result<(), String> {
    // Ensure the base output directory exists
    fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Failed to create output directory {:?}: {}", output_dir, e))?;

    let image_name = image_path.file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid image path".to_string())?;
    let image_extension = image_path.extension()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid image extension".to_string())?;

    versions.par_iter().map(|version| {
        let version_output_dir = output_dir.join(&version.name);
        fs::create_dir_all(&version_output_dir)
            .map_err(|e| format!("Failed to create version output directory {:?}: {}", version_output_dir, e))?;

        let output_file_name = format!("{}_{}.{}", image_name, version.name, image_extension);
        let output_file_path = version_output_dir.join(output_file_name);

        image_processing::process_and_save_image(
            &image_path,
            &output_file_path,
            version.crop.x,
            version.crop.y,
            version.crop.width,
            version.crop.height,
            version.export.long_edge,
            version.export.jpeg_quality,
        ).map_err(|e| format!("Failed to process and save image for version {}: {}", version.name, e))
    }).collect::<Result<Vec<()>, String>>()?;

    Ok(())
}
