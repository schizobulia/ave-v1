#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use image::{GenericImageView, DynamicImage, GenericImage, imageops};
use serde::Deserialize;

#[derive(Deserialize)]
enum WatermarkPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
    Tiled
}

fn adjust_alpha(img: &mut DynamicImage, alpha: f32) {
    let (width, height) = img.dimensions();
    for x in 0..width {
        for y in 0..height {
            let mut pixel = img.get_pixel(x, y);
            pixel[3] = (pixel[3] as f32 * alpha) as u8;
            img.put_pixel(x, y, pixel);
        }
    }
}

// 定义一个函数，添加水印图片到原始图片上
#[tauri::command]
fn add_watermark(
    img_path: &str,
    watermark_path: &str,
    contrast: f32,
    scale: f32,
    position: WatermarkPosition,
    output_path: &str,
) {
    let mut img = image::open(img_path).unwrap();
    let mut watermark: DynamicImage = image::open(watermark_path).unwrap();
    adjust_alpha(&mut watermark, 0.3);
    let a = watermark.adjust_contrast(contrast);

    let (width, height) = img.dimensions();

    let new_w_width = (width as f32 * scale) as u32;
    let new_w_height = (height as f32 * scale) as u32;

    let a = imageops::resize(&a, new_w_width, new_w_height, imageops::FilterType::Lanczos3);

    let margin = (width as f32 * 0.01) as u32;

    match position {
        WatermarkPosition::TopLeft => imageops::overlay(&mut img, &a, margin.into(), margin.into()),
        WatermarkPosition::TopRight => imageops::overlay(&mut img, &a, (width - new_w_width - margin).into(), margin.into()),
        WatermarkPosition::BottomLeft => imageops::overlay(&mut img, &a, margin.into(), (height - new_w_height - margin).into()),
        WatermarkPosition::BottomRight => imageops::overlay(&mut img, &a, (width - new_w_width - margin).into(), (height - new_w_height - margin).into()),
        WatermarkPosition::Tiled => {
            let num_rows = 3; // 这里是您想要的固定行数
            let num_cols = 3; // 这里是您想要的固定列数
            let step_x = width / (num_cols as u32 + 1);
            let step_y = height / (num_rows as u32 + 1);
            for i in 0..num_rows {
                for j in 0..num_cols {
                    let x = (j as u32 + 1) * step_x - new_w_width / 2;
                    let y = (i as u32 + 1) * step_y - new_w_height / 2;
                    imageops::overlay(&mut img, &a, x.into(), y.into());
                }
            }
        }
    }

    img.save(output_path).unwrap();
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_watermark])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
