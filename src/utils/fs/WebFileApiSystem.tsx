import {
  IFileSystem,
  type FileStats,
  type DirectoryEntry,
} from "./IFileSystem";

type FSAPHandle = FileSystemDirectoryHandle;

export class WebFileApiSystem extends IFileSystem {
  constructor(private rootHandle: FSAPHandle) {
    super();
  }

  private async resolvePathComponents(path: string): Promise<string[]> {
    return IFileSystem.normalizePath(path)
      .split("/")
      .filter((p) => p !== "");
  }

  private async resolveHandle(path: string): Promise<FileSystemHandle> {
    const parts = await this.resolvePathComponents(path);
    let currentHandle: FileSystemHandle = this.rootHandle;

    for (const part of parts) {
      if (currentHandle.kind !== "directory") {
        throw new Error(`Cannot traverse into non-directory at: ${part}`);
      }

      try {
        currentHandle = await (
          currentHandle as FileSystemDirectoryHandle
        ).getDirectoryHandle(part);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (dirError) {
        try {
          currentHandle = await (
            currentHandle as FileSystemDirectoryHandle
          ).getFileHandle(part);
          // 提前终止检查：文件节点不能在路径中间
          if (part !== parts[parts.length - 1]) {
            throw new Error(`File node cannot be in path middle: ${path}`);
          }
        } catch (fileError) {
          throw new Error(`Path resolution failed: ${path} (${fileError})`);
        }
      }
    }
    return currentHandle;
  }

  async _readFile(path: string): Promise<Uint8Array> {
    const handle = await this.resolveHandle(path);
    if (handle.kind !== "file") {
      throw new Error(`Path is not a file: ${path}`);
    }
    const file = await (handle as FileSystemFileHandle).getFile();
    return new Uint8Array(await file.arrayBuffer());
  }

  async _writeFile(path: string, content: Uint8Array | string): Promise<void> {
    const buffer =
      typeof content === "string" ? new TextEncoder().encode(content) : content;

    const parts = await this.resolvePathComponents(path);
    const fileName = parts.pop()!;
    const parentHandle = await this.ensureDirectoryPath(parts);

    const fileHandle = await parentHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(buffer);
    await writable.close();
  }

  private async ensureDirectoryPath(
    parts: string[],
    recursive = false,
  ): Promise<FileSystemDirectoryHandle> {
    let currentHandle = this.rootHandle;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentHandle = await currentHandle.getDirectoryHandle(part, {
        create: recursive,
      });
    }
    return currentHandle;
  }

  async _readDir(path: string): Promise<DirectoryEntry[]> {
    const handle = await this.resolveHandle(path);
    if (handle.kind !== "directory") {
      throw new Error(`Path is not a directory: ${path}`);
    }

    const entries: DirectoryEntry[] = [];

    for await (const [name, entry] of (handle as FileSystemDirectoryHandle)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      .entries()) {
      entries.push({ name, isDir: entry.kind === "directory" });
    }
    return entries;
  }

  async _mkdir(path: string, recursive = false): Promise<void> {
    const parts = await this.resolvePathComponents(path);
    await this.ensureDirectoryPath(parts, recursive);
  }

  async _stat(path: string): Promise<FileStats> {
    const handle = await this.resolveHandle(path);
    let size = 0;
    if (handle.kind === "file") {
      const file = await (handle as FileSystemFileHandle).getFile();
      size = file.size;
    }
    return {
      name: path.split("/").pop() || "",
      isDir: handle.kind === "directory",
      size,
      modified: new Date(), // 使用当前时间作为替代方案
    };
  }

  async _rename(oldPath: string, newPath: string): Promise<void> {
    // 递归复制函数
    const copyRecursive = async (
      srcHandle: FileSystemHandle,
      destDir: FileSystemDirectoryHandle,
      newName: string,
    ) => {
      if (srcHandle.kind === "file") {
        const file = await (srcHandle as FileSystemFileHandle).getFile();
        const newFile = await destDir.getFileHandle(newName, { create: true });
        const writable = await newFile.createWritable();
        await writable.write(await file.arrayBuffer());
        await writable.close();
      } else {
        const newDir = await destDir.getDirectoryHandle(newName, {
          create: true,
        });
        const srcDir = srcHandle as FileSystemDirectoryHandle;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        for await (const [name, entry] of srcDir.entries()) {
          await copyRecursive(entry, newDir, name);
        }
      }
    };

    const oldHandle = await this.resolveHandle(oldPath);
    const newParts = await this.resolvePathComponents(newPath);
    const newName = newParts.pop()!;
    const newDirHandle = await this.ensureDirectoryPath(newParts, true);

    await copyRecursive(oldHandle, newDirHandle, newName);
    await this._delete(oldHandle.kind, oldPath);
  }

  private async _delete(
    kind: "file" | "directory",
    path: string,
  ): Promise<void> {
    const parts = await this.resolvePathComponents(path);
    const targetName = parts.pop()!;
    const parentHandle = await this.ensureDirectoryPath(parts);

    await parentHandle.removeEntry(targetName, {
      recursive: kind === "directory",
    });
  }

  async _deleteFile(path: string): Promise<void> {
    await this._delete("file", path);
  }

  async _deleteDirectory(path: string): Promise<void> {
    await this._delete("directory", path);
  }

  async _exists(path: string): Promise<boolean> {
    try {
      await this.resolveHandle(path);
      return true;
    } catch {
      return false;
    }
  }
}
