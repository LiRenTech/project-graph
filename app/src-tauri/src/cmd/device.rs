use std::io::Read;

#[tauri::command]
pub fn get_device_id() -> Result<String, String> {
    let os_name = std::env::consts::OS;
    match os_name {
        "windows" => {
            // wmic csproduct get uuid
            let output = std::process::Command::new("wmic")
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
            let output = std::process::Command::new("system_profiler")
                .arg("SPHardwareDataType")
                .output();
            let stdout = String::from_utf8(output.unwrap().stdout).unwrap();
            let uuid = stdout
                .trim()
                .split("\n")
                .last()
                .unwrap()
                .split(":")
                .last()
                .unwrap()
                .trim()
                .to_string();
            Ok(uuid)
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
