#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use image::{GenericImageView, DynamicImage, imageops};
use serde::Deserialize;

#[derive(Deserialize)]
enum WatermarkPosition {
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
}

// 定义一个函数，添加水印图片到原始图片上
#[tauri::command]
fn add_watermark(
    img_path: &str, // 原始图片的路径
    watermark_path: &str, // 水印图片的路径
    contrast: f32, // 水印图片的透明度
    scale: f32, // 水印图片的缩放比例
    position: WatermarkPosition, // 水印图片的位置
    output_path: &str, // 输出图片的路径
){
    // 打开原始图片和水印图片
    let mut img = image::open(img_path).unwrap();
    let mut watermark: DynamicImage = image::open(watermark_path).unwrap();

    // 设置水印图片的透明度
    let a = watermark.adjust_contrast(contrast);

    // 获取原始图片和水印图片的尺寸
    let (width, height) = img.dimensions();

    // 计算水印图片的新尺寸，为原图的一定比例
    let new_w_width = (width as f32 * scale) as u32;
    let new_w_height = (height as f32 * scale) as u32;

    // 使用resize函数来缩放水印图片
    let a = imageops::resize(&a, new_w_width, new_w_height, imageops::FilterType::Lanczos3);

    // 计算边距大小，为原图的百分之一
    let margin = (width as f32 * 0.01) as u32;

    // 根据水印图片的位置来计算它的坐标
    let (x, y) = match position {
        WatermarkPosition::TopLeft => (margin, margin),
        WatermarkPosition::TopRight => (width - new_w_width - margin, margin),
        WatermarkPosition::BottomLeft => (margin, height - new_w_height - margin),
        WatermarkPosition::BottomRight => (width - new_w_width - margin, height - new_w_height - margin),
    };

    // 将水印图片添加到原始图片上
    imageops::overlay(&mut img, &a, x.into(), y.into());

    // 保存添加了水印的图片
    img.save(output_path);
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_watermark])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
