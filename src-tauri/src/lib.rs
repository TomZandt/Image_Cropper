mod commands;
mod image_processing;

use std::path::PathBuf;
use std::fs;
use image::{io::Reader as ImageReader, GenericImageView, ImageFormat};
use tauri_plugin_dialog::{DialogExt, FilePath}; // Import DialogExt and FilePath for the dialog plugin
use base64::{engine::general_purpose, Engine as _};
use std::io::Cursor;

// Tauri command to create a directory if it doesn't exist
#[tauri::command]
fn create_dir_if_not_exists(path: PathBuf) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    Ok(())
}

// Tauri command to get image as base64 string, with optional resizing for display
#[tauri::command]
fn get_image_base64(path: PathBuf, max_dimension: Option<u32>) -> Result<String, String> {
    let img = ImageReader::open(&path)
        .map_err(|e| format!("Failed to open image: {}", e))?
        .decode()
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    let (width, height) = img.dimensions();
    let mut img_to_encode = img;

    if let Some(max_dim) = max_dimension {
        if width > max_dim || height > max_dim {
            let ratio = (width as f32 / max_dim as f32).max(height as f32 / max_dim as f32);
            let new_width = (width as f32 / ratio).round() as u32;
            let new_height = (height as f32 / ratio).round() as u32;
            img_to_encode = img_to_encode.resize(new_width, new_height, image::imageops::FilterType::Lanczos3);
        }
    }

    let mut buffer = Cursor::new(Vec::new());
    let format = ImageFormat::from_path(&path)
        .map_err(|e| format!("Failed to determine image format: {}", e))?;

    img_to_encode.write_to(&mut buffer, format)
        .map_err(|e| format!("Failed to write image to buffer: {}", e))?;

    let base64_string = general_purpose::STANDARD.encode(buffer.into_inner());
    let mime_type = match format {
        ImageFormat::Png => "png",
        ImageFormat::Jpeg => "jpeg",
        // Add other formats as needed
        _ => "png", // Default to png if format is unknown or not handled
    };
    Ok(format!("data:image/{};base64,{}", mime_type, base64_string))
}

// Tauri command to open a folder selection dialog
#[tauri::command]
fn select_folder(app_handle: tauri::AppHandle) -> Option<String> {
    let (tx, rx) = std::sync::mpsc::channel();
    app_handle.dialog().file().pick_folder(move |path: Option<FilePath>| {
        tx.send(path.map(|fp| fp.to_string())).unwrap(); // Convert FilePath to String
    });
    rx.recv().unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init()) // Initialize the dialog plugin
        .plugin(tauri_plugin_fs::init()) // Initialize the fs plugin
        .plugin(tauri_plugin_shell::init()) // Initialize the shell plugin
        .invoke_handler(tauri::generate_handler![
            select_folder,
            create_dir_if_not_exists,
            get_image_base64,
            commands::load_folder,
            commands::save_crop_data,
            commands::export_versions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
