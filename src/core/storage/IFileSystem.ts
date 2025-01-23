export interface FileStats {
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export interface DirectoryEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
}

export interface IFileSystem {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, content: Uint8Array | string): Promise<void>;
  readDir(path: string): Promise<DirectoryEntry[]>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  stat(path: string): Promise<FileStats>;
  rename(oldPath: string, newPath: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
