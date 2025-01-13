import { invoke } from "@tauri-apps/api/core";
import { PathString } from "./pathString";
import { isWeb } from "./platform";

/**
 * 检查一个文件是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export async function exists(path: string): Promise<boolean> {
  if (isWeb) {
    return true;
  } else {
    return invoke("exists", { path });
  }
}

/**
 * 读取文本文件内容
 * @param path 文件路径
 * @returns 文件内容
 */
export async function readTextFile(path: string): Promise<string> {
  if (isWeb) {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = () => {
        const file = input.files?.item(0);
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as string;
            resolve(content);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        }
      };
      input.click();
    });
  } else {
    return invoke("read_text_file", { path });
  }
}

/**
 * 读取文件并返回二进制数据
 * @param path 文件路径
 * @returns 文件的 Uint8Array 表示
 */
export async function readFile(path: string): Promise<Uint8Array> {
  if (isWeb) {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = () => {
        const file = input.files?.item(0);
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as ArrayBuffer;
            const bytes = new Uint8Array(content);
            resolve(bytes);
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        }
      };
      input.click();
    });
  } else {
    const base64 = await invoke<string>("read_file_base64", { path });
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

/**
 * 读取文件并以 base64 编码返回
 * @param path 文件路径
 * @returns 文件的 base64 编码
 */
export async function readFileBase64(path: string): Promise<string> {
  if (isWeb) {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = () => {
        const file = input.files?.item(0);
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as string;
            resolve(content);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  } else {
    return invoke("read_file_base64", { path });
  }
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
  if (isWeb) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = PathString.absolute2file(path);
    a.click();
    URL.revokeObjectURL(url);
  } else {
    return invoke("write_text_file", { path, content });
  }
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
  if (isWeb) {
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = PathString.absolute2file(path);
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const base64url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(new Blob([content]));
    });
    const base64 = btoa(base64url.split(",")[1]);
    return invoke("write_file_base64", { path, content: base64 });
  }
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
  if (isWeb) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = PathString.absolute2file(path);
    a.click();
    URL.revokeObjectURL(url);
  } else {
    return invoke("write_file_base64", { path, content });
  }
}
