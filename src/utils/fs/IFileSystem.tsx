export interface FileStats {
  name: string;
  isDir: boolean;
  size: number;
  modified: Date;
}

export interface DirectoryEntry {
  name: string;
  isDir: boolean;
}
export function base64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const sliceSize = 572;
  const bytes = new Uint8Array((base64.length / 4) * 3);
  let byteIndex = 0;

  for (let offset = 0; offset < base64.length; offset += sliceSize) {
    const slice = base64.slice(offset, offset + sliceSize);

    const byteChars = atob(slice);

    for (let i = 0; i < byteChars.length; i++) {
      bytes[byteIndex++] = byteChars.charCodeAt(i);
    }
  }

  return bytes.subarray(0, byteIndex);
}

export function uint8ArrayToBase64(u8Arr: Uint8Array): string {
  let binaryStr = "";
  for (let i = 0; i < u8Arr.length; i++) {
    binaryStr += String.fromCharCode(u8Arr[i]);
  }
  return btoa(binaryStr);
}

// 强制使用 `/` 作为分隔符
export abstract class IFileSystem {
  // 私有方法：统一规范化路径格式
  static normalizePath(path: string): string {
    return path.replace(/[\\/]+/g, "/"); // 替换所有分隔符为 /
  }

  // 抽象原始方法（带下划线版本）
  abstract _readFile(path: string): Promise<Uint8Array>;
  abstract _writeFile(
    path: string,
    content: Uint8Array | string,
  ): Promise<void>;
  abstract _readDir(path: string): Promise<DirectoryEntry[]>;
  abstract _mkdir(path: string, recursive?: boolean): Promise<void>;
  abstract _stat(path: string): Promise<FileStats>;
  abstract _rename(oldPath: string, newPath: string): Promise<void>;
  abstract _deleteFile(path: string): Promise<void>;
  abstract _deleteDirectory(path: string): Promise<void>;
  abstract _exists(path: string): Promise<boolean>;

  // 公共方法（自动处理路径分隔符）
  readFile(path: string) {
    return this._readFile(IFileSystem.normalizePath(path));
  }

  writeFile(path: string, content: Uint8Array | string) {
    return this._writeFile(IFileSystem.normalizePath(path), content);
  }

  readDir(path: string) {
    return this._readDir(IFileSystem.normalizePath(path));
  }

  mkdir(path: string, recursive?: boolean) {
    return this._mkdir(IFileSystem.normalizePath(path), recursive);
  }

  stat(path: string) {
    return this._stat(IFileSystem.normalizePath(path));
  }

  rename(oldPath: string, newPath: string) {
    return this._rename(
      IFileSystem.normalizePath(oldPath),
      IFileSystem.normalizePath(newPath),
    );
  }

  deleteFile(path: string) {
    return this._deleteFile(IFileSystem.normalizePath(path));
  }

  deleteDirectory(path: string) {
    return this._deleteDirectory(IFileSystem.normalizePath(path));
  }

  exists(path: string) {
    return this._exists(IFileSystem.normalizePath(path));
  }

  async readTextFile(path: string) {
    const content = await this.readFile(path); // 注意这里调用的是处理后的公共方法
    return new TextDecoder("utf-8").decode(content);
  }
  async writeTextFile(path: string, content: string) {
    const text = new TextEncoder().encode(content);
    return this.writeFile(path, text); // 注意这里调用的是处理后的公共方法
  }

  async readFileBase64(path: string) {
    return uint8ArrayToBase64(await this.readFile(path));
  }
  async writeFileBase64(path: string, str: string) {
    return this.writeFile(path, base64ToUint8Array(str));
  }
}
