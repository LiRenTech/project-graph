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

// 强制使用 `/` 作为分隔符
export abstract class IFileSystem {
  abstract readFile(path: string): Promise<Uint8Array>;
  abstract writeFile(path: string, content: Uint8Array | string): Promise<void>;
  abstract readDir(path: string): Promise<DirectoryEntry[]>;
  abstract mkdir(path: string, recursive?: boolean): Promise<void>;
  abstract stat(path: string): Promise<FileStats>;
  abstract rename(oldPath: string, newPath: string): Promise<void>;
  abstract deleteFile(path: string): Promise<void>;
  abstract deleteDirectory(path: string): Promise<void>;
  abstract exists(path: string): Promise<boolean>;
  async readTextFile(path: string) {
    const content = await this.readFile(path);
    return new TextDecoder("utf-8").decode(content);
  }
}
