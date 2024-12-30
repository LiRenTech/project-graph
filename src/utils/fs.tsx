import { invoke } from "@tauri-apps/api/core";

/**
 * 检查一个文件是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export async function exists(path: string): Promise<boolean> {
  return invoke("exists", { path });
}

/**
 * 读取文本文件内容
 * @param path 文件路径
 * @returns 文件内容
 */
export async function readTextFile(path: string): Promise<string> {
  return invoke("read_text_file", { path });
}

/**
 * 读取文件并返回二进制数据
 * @param path 文件路径
 * @returns 文件的 Uint8Array 表示
 */
export async function readFile(path: string): Promise<Uint8Array> {
  const base64 = await invoke<string>("read_file_base64", { path });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * 读取文件并以 base64 编码返回
 * @param path 文件路径
 * @returns 文件的 base64 编码
 */
export async function readFileBase64(path: string): Promise<string> {
  return invoke("read_file_base64", { path });
}

/**
 * 将内容写入文本文件
 * @param path 文件路径
 * @param content 文件内容
 */
export async function writeTextFile(
  path: string,
  content: string,
): Promise<void> {
  return invoke("write_text_file", { path, content });
}

/**
 * 将二进制数据写入文件
 * @param path 文件路径
 * @param content 文件的 Uint8Array 表示
 */
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

  // 转换base64 完成
  console.log(base64);
  return invoke("write_file_base64", { path, content: base64 });
}

/**
 * 将内容以 base64 编码写入文件
 * @param path 文件路径
 * @param content 文件的 base64 编码内容
 */
export async function writeFileBase64(
  path: string,
  content: string,
): Promise<void> {
  return invoke("write_file_base64", { path, content });
}
