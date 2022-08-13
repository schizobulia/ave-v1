#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use nfd2::Response;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![select_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn select_video(video_exts: String) -> Vec<String> {
    let files = open_directory(video_exts);
    return files;
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
