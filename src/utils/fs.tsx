import { invoke } from "@tauri-apps/api/core";

export async function exists(path: string): Promise<boolean> {
  return invoke("exists", { path });
}
export async function readTextFile(path: string): Promise<string> {
  return invoke("read_text_file", { path });
}
export async function readFile(path: string): Promise<Uint8Array> {
  const base64 = await invoke<string>("read_file_base64", { path });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
export async function readFileBase64(path: string): Promise<string> {
  return invoke("read_file_base64", { path });
}
export async function writeTextFile(
  path: string,
  content: string,
): Promise<void> {
  return invoke("write_text_file", { path, content });
}
export async function writeFile(
  path: string,
  content: Uint8Array,
): Promise<void> {
  const base64url = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([content]));
  });
  const base64 = btoa(base64url.split(",")[1]);
  return invoke("write_file_base64", { path, content: base64 });
}
export async function writeFileBase64(
  path: string,
  content: string,
): Promise<void> {
  return invoke("write_file_base64", { path, content });
}
