use std::path::{Path, PathBuf};

//获取文件名称, 但不包含后缀
pub fn get_filename(file_path: String) -> String {
    let option = PathBuf::from(file_path);
    option.file_stem().unwrap().to_string_lossy().to_string()
}

//获取文件的上一级目录
pub fn get_file_parent(input_file: &str) -> &str {
    Path::new(input_file).parent().unwrap().to_str().unwrap()
}