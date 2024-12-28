use std::env;
use std::io::Read;

use base64::engine::general_purpose;
use base64::Engine;

use tauri::Manager; // 引入 base64 编码函数

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
    std::fs::write(path, content).map_err(|e| e.to_string())?;
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
    Ok(general_purpose::STANDARD
        .encode(&std::fs::read(image_path).map_err(|e| format!("无法读取文件: {}", e))?))
}

/// 将base64编码字符串保存为图片文件
#[tauri::command]
fn save_base64_to_image(base64_str: &str, file_name: &str) -> Result<(), String> {
    std::fs::write(
        file_name,
        &general_purpose::STANDARD
            .decode(base64_str)
            .map_err(|e| format!("解码失败: {}", e))?,
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// 读取 MP3 文件并返回其 Base64 编码字符串
#[tauri::command]
fn read_mp3_file(path: String) -> Result<String, String> {
    // 将文件内容编码为 Base64
    Ok(general_purpose::STANDARD
        .encode(&std::fs::read(path).map_err(|e| format!("读取文件时出错: {}", e))?))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 在 Linux 上禁用 DMA-BUF 渲染器
    // 否则无法在 Linux 上运行
    // 相同的bug: https://github.com/tauri-apps/tauri/issues/10702
    // 解决方案来源: https://github.com/clash-verge-rev/clash-verge-rev/blob/ae5b2cfb79423c7e76a281725209b812774367fa/src-tauri/src/lib.rs#L27-L28
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_cli::init())?;
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
