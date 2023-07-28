#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::Path;
use nfd2::Response;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![select_single_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn select_single_video(video_exts: String) -> String {
    let p = tauri::api::path::video_dir().expect("").to_string_lossy().to_string();
    let res = nfd2::open_file_dialog(Option::from(video_exts.as_str()),
                                     Option::from(Path::new(p.as_str())));
    match res.expect("oh no") {
        Response::Okay(file_path) => {
            file_path.to_string_lossy().to_string()
        }
        Response::OkayMultiple(_) => {
            String::from("")
        }
        Response::Cancel => {
            String::from("")
        }
    }
}
