use std::{io::Read, process::Command};

#[tauri::command]
pub fn get_device_id() -> Result<String, String> {
    let os_name = std::env::consts::OS;
    match os_name {
        "windows" => {
            // wmic csproduct get uuid
            let output = Command::new("wmic")
                .arg("csproduct")
                .arg("get")
                .arg("uuid")
                .output();
            let stdout = String::from_utf8(output.unwrap().stdout).unwrap();
            let uuid = stdout.trim().split("\n").last().unwrap().to_string();
            Ok(uuid)
        }
        "macos" => {
            // system_profiler SPHardwareDataType | awk '/Serial/ {print $4}'
            let output = Command::new("system_profiler")
                .arg("SPHardwareDataType")
                .output()
                .expect("Failed to execute system_profiler");
            if !output.status.success() {
                eprintln!("Error running system_profiler");
                return Err("Failed to get device id".to_string())
            }
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if line.trim().starts_with("Hardware UUID") {
                    let parts: Vec<&str> = line.split(':').collect();
                    if parts.len() > 1 {
                        let uuid = parts[1].trim();
                        println!("Hardware UUID: {}", uuid);
                        return Ok(uuid.to_string())
                    }
                }
            }
            Err("Failed to get device id".to_string())
        }
        "linux" => {
            // read file /etc/machine-id
            let mut file = std::fs::File::open("/etc/machine-id").unwrap();
            let mut contents = String::new();
            file.read_to_string(&mut contents).unwrap();
            Ok(contents.trim().to_string())
        }
        _ => Err("Unsupported platform".to_string()),
    }
}
