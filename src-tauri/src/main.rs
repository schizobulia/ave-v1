#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use nfd2::Response;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct VideoConfig {
    ext: String,
    quality: String,
    save_path: String
}

fn main() {
    init_video_config();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            select_video, update_video_config, get_video_config, select_save_file_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn select_video(video_exts: String) -> Vec<String> {
    let files = open_directory(video_exts);
    return files;
}

#[tauri::command]
fn update_video_config(config: VideoConfig) -> bool {
    init_video_config();
    let p = get_save_path();
    let mut file = File::create(&p).unwrap();
    file.write(serde_json::to_string(&config).unwrap().as_bytes()).unwrap();
    true
}

#[tauri::command]
fn get_video_config() -> VideoConfig {
    init_video_config();
    let mut contents = String::new();
    let p = get_save_path();
    let mut file = File::open(&p).unwrap();
    file.read_to_string(&mut contents).unwrap();
    let data: VideoConfig = serde_json::from_str(contents.as_str()).unwrap();
    data
}

fn init_video_config() {
    let p = get_save_path();
    if !Path::new(&p).exists() {
        let video_config = VideoConfig {
            ext: "MP4".to_string(),
            quality: "中".to_string(),
            save_path: tauri::api::path::download_dir().unwrap().to_string_lossy().to_string()
        };
        let mut file = File::create(p).unwrap();
        file.write(serde_json::to_string(&video_config).unwrap().as_bytes()).unwrap();
    }
}

#[tauri::command]
fn select_save_file_path() -> String {
    let mut res = String::from("");
    match nfd2::open_pick_folder(None).expect("oh no") {
        Response::Okay(file_path) => { res = file_path.to_string_lossy().to_string(); },
        Response::Cancel => {}
        _ => {}
    }
    return res
}

fn open_directory(video_exts: String) -> Vec<String> {
    let mut res = Vec::new();
    match nfd2::dialog_multiple()
        .filter(video_exts.as_str())
        .open()
        .expect("oh no")
    {
        Response::Okay(file_path) => {
            res.push(file_path.to_string_lossy().to_string());
        }
        Response::OkayMultiple(files) => {
            for i in files {
                res.push(i.to_string_lossy().to_string());
            }
        }
        Response::Cancel => {}
    }
    res
}


fn get_save_path() -> String {
    format!("{}{}", tauri::api::path::cache_dir().unwrap().to_string_lossy(), "/config.json")
}