#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use image::{GenericImageView, DynamicImage, GenericImage, ImageBuffer, imageops};
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

#[tauri::command]
fn merge_images(paths: Vec<&str>, max_images_per_row: u32, padding: u32, output_path: &str) {
    // 初始化一些变量来存储新图片的尺寸
    let mut total_width = 0;
    let mut total_height = 0;
    let mut max_width = 0;
    let mut max_height = 0;

    // 首先，我们需要遍历所有的图片来确定新图片的尺寸
    for (i, path) in paths.iter().enumerate() {
        let img = image::open(path).unwrap();
        let (width, height) = img.dimensions();
        if i as u32 % max_images_per_row == 0 {
            total_height += max_height;
            max_height = 0;
        }
        total_width = total_width.max((width + padding) * max_images_per_row);
        max_height = max_height.max(height);
    }
    total_height += max_height;

    // 创建一个新的图片缓冲区
    let mut imgbuf = ImageBuffer::new(total_width, total_height + padding * (paths.len() as u32 / max_images_per_row));

    // 再次遍历所有的图片，将它们复制到新的图片缓冲区
    let mut current_width = padding as i64;
    let mut current_height = 0;
    max_height = 0;
    for (i, path) in paths.iter().enumerate() {
        let img = image::open(path).unwrap();
        let (_, height) = img.dimensions();
        if i as u32 % max_images_per_row == 0 && i != 0 {
            current_height += max_height + padding;
            current_width = padding as i64;
            max_height = 0;
        }
        imageops::replace(&mut imgbuf, &img, current_width, current_height as i64);
        current_width += img.width() as i64 + padding as i64;
        max_height = max_height.max(height);
    }

    // 保存新的图片
    imgbuf.save(output_path);
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_watermark, merge_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
