use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, MAIN_SEPARATOR};
use std::time::UNIX_EPOCH;
use tauri::Manager;

// 新增路径规范化函数
fn normalize_path(path: &str) -> String {
    path.replace('/', &MAIN_SEPARATOR.to_string())
}

#[derive(Debug, Serialize, Deserialize)]
struct FileStats {
    name: String,
    #[serde(rename = "isDir")]
    is_directory: bool,
    size: u64,
    modified: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct DirectoryEntry {
    name: String,
    #[serde(rename = "isDir")]
    is_directory: bool,
}

#[tauri::command]
async fn read_file(path: String) -> Result<Vec<u8>, String> {
    let path = normalize_path(&path);
    std::fs::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(path: String, content: Vec<u8>) -> Result<(), String> {
    let path = normalize_path(&path);
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn read_dir(path: String) -> Result<Vec<DirectoryEntry>, String> {
    let path = normalize_path(&path);
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;

        result.push(DirectoryEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
        });
    }

    Ok(result)
}

#[tauri::command]
async fn mkdir(path: String, recursive: bool) -> Result<(), String> {
    let path = normalize_path(&path);
    if recursive {
        fs::create_dir_all(path).map_err(|e| e.to_string())
    } else {
        fs::create_dir(path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn stat(path: String) -> Result<FileStats, String> {
    let normalized_path = normalize_path(&path);
    let metadata = fs::metadata(&normalized_path).map_err(|e| e.to_string())?;

    let name = Path::new(&normalized_path)
        .file_name()
        .and_then(|n| n.to_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "无法解析文件名".to_string())?;

    let modified = metadata
        .modified()
        .map_err(|e| e.to_string())?
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis() as i64;

    Ok(FileStats {
        name,
        is_directory: metadata.is_dir(),
        size: metadata.len(),
        modified,
    })
}

#[tauri::command]
async fn rename(old_path: String, new_path: String) -> Result<(), String> {
    let old_path = normalize_path(&old_path);
    let new_path = normalize_path(&new_path);
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let path = normalize_path(&path);
    fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_directory(path: String) -> Result<(), String> {
    let path = normalize_path(&path);
    fs::remove_dir_all(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn exists(path: String) -> Result<bool, String> {
    let path = normalize_path(&path);
    Ok(fs::metadata(path).is_ok())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_cli::init())?;
                app.handle().plugin(tauri_plugin_process::init())?;
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            read_dir,
            mkdir,
            stat,
            rename,
            delete_file,
            delete_directory,
            exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
