import { invoke } from "@tauri-apps/api/core";

export function writeStdout(content: string): Promise<void> {
  return invoke("write_stdout", { content });
}

export function writeStderr(content: string): Promise<void> {
  return invoke("write_stderr", { content });
}

export function openDevtools(): Promise<void> {
  return invoke("open_devtools");
}

export function exit(code: number): Promise<void> {
  return invoke("exit", { code });
}
