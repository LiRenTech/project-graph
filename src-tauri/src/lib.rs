use std::fs::File;
use std::io::Read;
use std::io::Write;

use base64::engine::general_purpose;
use base64::Engine;

use std::env;
use std::fs::read; // 引入 read 函数用于读取文件
use tauri::Manager; // 引入 base64 编码函数
use tauri::Runtime;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 通过路径打开json文件，返回json字符串
#[tauri::command]
fn open_file_by_path(path: String) -> String {
    let mut file = std::fs::File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    contents
}

/// 保存字符串到指定路径
#[tauri::command]
fn save_file_by_path(path: String, content: String) -> Result<bool, String> {
    let mut file = std::fs::File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes())
        .map_err(|e| e.to_string())?;
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

#[tauri::command]
fn convert_image_to_base64(image_path: String) -> Result<String, String> {
    match read(&image_path) {
        Ok(image_data) => {
            // let base64_str = Engine::encode(&image_data);
            let base64_str = general_purpose::STANDARD.encode(&image_data);
            Ok(base64_str)
        }
        Err(e) => Err(format!("无法读取文件: {}, {}", e, image_path)),
    }
}

/// 将base64编码字符串保存为图片文件
#[tauri::command]
fn save_base64_to_image(base64_str: &str, file_name: &str) -> Result<(), String> {
    // 进行解码
    match general_purpose::STANDARD.decode(base64_str) {
        Ok(image_data) => {
            // 创建文件并写入数据
            let mut file = File::create(file_name).map_err(|e| format!("无法创建文件: {}", e))?;
            file.write_all(&image_data)
                .map_err(|e| format!("无法写入文件: {}", e))?;
            Ok(())
        }
        Err(e) => Err(format!("解码失败: {}", e)),
    }
}

/// 读取 MP3 文件并返回其 Base64 编码字符串
#[tauri::command]
fn read_mp3_file(path: String) -> Result<String, String> {
    let mut file = File::open(&path).map_err(|e| format!("无法打开文件: {}", e))?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| format!("读取文件时出错: {}", e))?;
    
    // 将文件内容编码为 Base64
    let base64_str = general_purpose::STANDARD.encode(&buffer);
    Ok(base64_str)
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("程序运行了！");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            open_file_by_path,
            save_file_by_path,
            convert_image_to_base64,
            save_base64_to_image,
            check_json_exist,
            read_mp3_file
        ])
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
