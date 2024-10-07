use tauri::Manager;

use std::io::Read;
use std::io::Write;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
/// 通过路径打开json文件，返回json字符串
#[tauri::command]
fn open_json_by_path(path: String) -> String {
    let mut file = std::fs::File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    contents
}

/// 保存json字符串到指定路径
#[tauri::command]
fn save_json_by_path(path: String, content: String) -> Result<bool, String> {
    let mut file = std::fs::File::create(path).unwrap();
    file.write_all(content.as_bytes()).unwrap();
    Ok(true)
}
/// 检查json文件是否存在
/// 返回true表示存在，false表示不存在
#[tauri::command]
fn check_json_exist(path: String) -> bool {
    std::path::Path::new(&path).exists()
}

// #[tauri::command]
// fn open_dev_tools() {
//     let window = app.get_webview_window("main").unwrap();
//     window.open_devtools();
// }


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            open_json_by_path,
            save_json_by_path,
            check_json_exist,
            // open_dev_tools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
