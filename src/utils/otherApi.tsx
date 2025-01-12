import { invoke } from "@tauri-apps/api/core";
import { isWeb } from "./platform";

export async function writeStdout(content: string): Promise<void> {
  if (isWeb) {
    console.log("STDOUT:", content);
  } else {
    return invoke("write_stdout", { content });
  }
}

export async function writeStderr(content: string): Promise<void> {
  if (isWeb) {
    console.error("STDERR:", content);
  } else {
    return invoke("write_stderr", { content });
  }
}

export async function openDevtools(): Promise<void> {
  if (isWeb) {
    console.log("open devtools is not supported on web platform");
  } else {
    return invoke("open_devtools");
  }
}

export async function exit(code: number = 0): Promise<void> {
  if (isWeb) {
    window.close();
  } else {
    return invoke("exit", { code });
  }
}

export async function getVersion(): Promise<string> {
  if (isWeb) {
    return "0.0.0-web";
  } else {
    return await invoke("get_version");
  }
}
