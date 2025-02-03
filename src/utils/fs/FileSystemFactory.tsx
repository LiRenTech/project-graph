import { IFileSystem } from "./IFileSystem";
import { TauriFileSystem } from "./TauriFileSystem";

export type StorageType = "tauri" | "memory";

export class FileSystemFactory {
  static create(storageType: StorageType = "tauri"): IFileSystem {
    switch (storageType) {
      case "tauri":
        return new TauriFileSystem();
      default:
        throw new Error(`Unsupported storage type: ${storageType}`);
    }
  }
}
