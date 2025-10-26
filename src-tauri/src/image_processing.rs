// src-tauri/src/image_processing.rs
use image::{io::Reader as ImageReader, GenericImageView, ImageFormat};
use std::path::PathBuf;
use anyhow::{Result, anyhow};
use std::fs::File;
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::PngEncoder;
use image::ImageEncoder; // For the trait

pub fn process_and_save_image(
    source_path: &PathBuf,
    output_path: &PathBuf,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
    long_edge: u32,
    jpeg_quality: u8,
) -> Result<()> {
    let img = ImageReader::open(source_path)?
        .decode()?;

    let cropped_img = img.crop_imm(x, y, width, height);

    let (cropped_width, cropped_height) = cropped_img.dimensions();

    let resized_img = if cropped_width > long_edge || cropped_height > long_edge {
        let ratio = (cropped_width as f32 / long_edge as f32).max(cropped_height as f32 / long_edge as f32);
        let new_width = (cropped_width as f32 / ratio).round() as u32;
        let new_height = (cropped_height as f32 / ratio).round() as u32;
        cropped_img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3)
    } else {
        cropped_img.to_rgba8().into()
    };

    let format = ImageFormat::from_path(output_path)
        .unwrap_or(ImageFormat::Jpeg); // Default to JPEG if format cannot be determined from output path

    let file = File::create(output_path)?;

    match format {
        ImageFormat::Jpeg => {
            let mut encoder = JpegEncoder::new_with_quality(file, jpeg_quality);
            let rgba_img = resized_img.to_rgba8();
            encoder.encode(rgba_img.as_raw(), rgba_img.width(), rgba_img.height(), image::ColorType::Rgba8)?;
        },
        ImageFormat::Png => {
            let encoder = PngEncoder::new(file);
            let rgba_img = resized_img.to_rgba8();
            encoder.write_image(rgba_img.as_raw(), rgba_img.width(), rgba_img.height(), image::ColorType::Rgba8)?;
        },
        _ => return Err(anyhow!("Unsupported output format: {:?}", format)),
    }

    Ok(())
}
