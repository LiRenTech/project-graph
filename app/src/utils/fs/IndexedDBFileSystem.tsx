import { IFileSystem, type FileStats, type DirectoryEntry } from "./IFileSystem";

const DB_VERSION = 1;

function asPromise<T>(i: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    i.onsuccess = () => resolve(i.result);
    i.onerror = () => reject(i.error);
  });
}

export class IndexedDBFileSystem extends IFileSystem {
  private db: IDBDatabase | null = null;
  private DIR_STORE_NAME: string;
  constructor(
    private DB_NAME: string,
    private STORE_NAME: string,
  ) {
    super();
    this.DIR_STORE_NAME = STORE_NAME + "_DIR";
    this.initDB();
  }

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        db.createObjectStore(this.STORE_NAME);
      }
      if (!db.objectStoreNames.contains(this.DIR_STORE_NAME)) {
        db.createObjectStore(this.DIR_STORE_NAME);
      }
    };
    this.db = await asPromise(request);
  }

  private async getTransaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = "readonly",
  ): Promise<IDBTransaction> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!.transaction(storeNames, mode);
  }

  // private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
  //   const t = await this.getTransaction(storeName, mode);
  //   return t.objectStore(storeName);
  // }

  private normalizePath(path: string): string {
    let normalized = path.replace(/\/+/g, "/").replace(/\/$/, "");
    if (normalized === "") return "/";
    if (!normalized.startsWith("/")) normalized = "/" + normalized;
    return normalized;
  }

  private getParentPath(path: string): string | null {
    const normalized = this.normalizePath(path);
    if (normalized === "/") return null;
    const parts = normalized.split("/").filter((p) => p !== "");
    if (parts.length === 0) return null;
    parts.pop();
    return parts.length === 0 ? "/" : `/${parts.join("/")}`;
  }

  private async addEntryToParent(childPath: string, isDir: boolean, t?: IDBTransaction): Promise<void> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    const parentPath = this.getParentPath(childPath);
    if (!parentPath) return;

    // 确保父目录存在（递归创建）
    if (!(await this._exists(parentPath, t))) {
      await this._mkdir(parentPath, true, t);
    }

    const store = await t.objectStore(this.DIR_STORE_NAME);
    const parentDir = await asPromise(store.get(parentPath));
    const childName = childPath.split("/").pop()!;

    if (!parentDir) {
      throw new Error(`Parent directory ${parentPath} not found`);
    }

    const exists = parentDir.some((e: DirectoryEntry) => e.name === childName);
    if (!exists) {
      parentDir.push({ name: childName, isDir });
      await asPromise(store.put(parentDir, parentPath));
    }
  }

  async _exists(path: string, t?: IDBTransaction): Promise<boolean> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readonly");
    path = this.normalizePath(path);
    const fileExists = !!(await asPromise(t.objectStore(this.STORE_NAME).get(path)));
    if (fileExists) return true;
    return !!(await asPromise(t.objectStore(this.DIR_STORE_NAME).get(path)));
  }

  async _readFile(path: string, t?: IDBTransaction): Promise<Uint8Array> {
    if (!t) t = await this.getTransaction([this.STORE_NAME], "readonly");
    const store = t.objectStore(this.STORE_NAME);
    const result = await asPromise(store.get(path));
    if (result) return result;
    throw new Error(`File not found: ${path}`);
  }

  async _mkdir(path: string, recursive = false, t?: IDBTransaction): Promise<void> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    path = this.normalizePath(path);
    if (path === "/") {
      const exists = await this._exists("/", t);
      if (!exists) {
        const store = t.objectStore(this.DIR_STORE_NAME);
        await asPromise(store.put([], "/"));
      }
      return;
    }

    if (!recursive) {
      const parentPath = this.getParentPath(path);
      if (parentPath && !(await this._exists(parentPath, t))) {
        throw new Error(`Parent directory does not exist: ${parentPath}`);
      }
      const store = t.objectStore(this.DIR_STORE_NAME);
      await asPromise(store.put([], path));
      if (parentPath) await this.addEntryToParent(path, true, t);
      return;
    }

    const parts = path.split("/").filter((p) => p !== "");
    let currentPath = "";
    const pathsToCreate: string[] = [];
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
      currentPath = this.normalizePath(currentPath);
      if (!(await this._exists(currentPath, t))) {
        pathsToCreate.push(currentPath);
      }
    }

    const store = await t.objectStore(this.DIR_STORE_NAME);
    for (const p of pathsToCreate) {
      await asPromise(store.put([], p));
      await this.addEntryToParent(p, true, t);
    }
  }

  async _writeFile(path: string, content: Uint8Array | string, t?: IDBTransaction): Promise<void> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    path = this.normalizePath(path);
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      await this._mkdir(parentPath, true, t);
    }

    const store = t.objectStore(this.STORE_NAME);
    const data = typeof content === "string" ? new TextEncoder().encode(content) : content;
    await asPromise(store.put(data, path));
    await this.addEntryToParent(path, false, t);
  }

  async _readDir(path: string, t?: IDBTransaction): Promise<DirectoryEntry[]> {
    if (!t) t = await this.getTransaction([this.DIR_STORE_NAME], "readonly");
    path = this.normalizePath(path);
    const store = t.objectStore(this.DIR_STORE_NAME);
    const dirEntry = await asPromise(store.get(path));
    if (!dirEntry) {
      throw new Error(`Directory not found: ${path}`);
    }
    return dirEntry;
  }

  async _stat(path: string, t?: IDBTransaction): Promise<FileStats> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readonly");
    const fileStore = t.objectStore(this.STORE_NAME);
    const dirStore = t.objectStore(this.DIR_STORE_NAME);
    const file = await asPromise(fileStore.get(path));
    if (file) {
      return {
        name: path.split("/").pop() || "",
        isDir: false,
        size: file.byteLength,
        modified: new Date(),
      };
    }
    const dir = await asPromise(dirStore.get(path));
    if (dir) {
      return {
        name: path.split("/").pop() || "",
        isDir: true,
        size: 0,
        modified: new Date(),
      };
    }
    throw new Error(`Path not found: ${path}`);
  }

  async _rename(oldPath: string, newPath: string, t?: IDBTransaction): Promise<void> {
    oldPath = this.normalizePath(oldPath);
    newPath = this.normalizePath(newPath);
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    const filesStore = t.objectStore(this.STORE_NAME);
    const dirsStore = t.objectStore(this.DIR_STORE_NAME);

    const isDir = !!(await asPromise(dirsStore.get(oldPath)));
    if (isDir) {
      // 处理目录重命名及子项
      const dir = await asPromise(dirsStore.get(oldPath));
      if (!dir) throw new Error(`Directory not found: ${oldPath}`);
      await asPromise(dirsStore.delete(oldPath));
      await asPromise(dirsStore.put(dir, newPath));

      // 更新所有子路径
      const filesCursor = await asPromise(filesStore.openCursor());
      const dirsCursor = await asPromise(dirsStore.openCursor());
      const updateEntries = async (cursor: IDBCursorWithValue | null) => {
        while (cursor) {
          const oldChildPath = cursor.key as string;
          if (oldChildPath.startsWith(`${oldPath}/`)) {
            const newChildPath = newPath + oldChildPath.slice(oldPath.length);
            if (cursor.source.name === this.STORE_NAME) {
              await asPromise(filesStore.delete(oldChildPath));
              await asPromise(filesStore.put(cursor.value, newChildPath));
            } else {
              await asPromise(dirsStore.delete(oldChildPath));
              await asPromise(dirsStore.put(cursor.value, newChildPath));
            }
          }
          cursor.continue();
        }
      };
      await updateEntries(filesCursor);
      await updateEntries(dirsCursor);
    } else {
      // 处理文件重命名
      const file = await asPromise(filesStore.get(oldPath));
      if (!file) throw new Error(`File not found: ${oldPath}`);
      await asPromise(filesStore.delete(oldPath));
      await asPromise(filesStore.put(file, newPath));
    }

    // 更新父目录条目
    const oldParentPath = this.getParentPath(oldPath);
    const newParentPath = this.getParentPath(newPath);
    if (oldParentPath) {
      const oldParentStore = t.objectStore(this.DIR_STORE_NAME);
      let oldParent = await asPromise(oldParentStore.get(oldParentPath));
      if (oldParent) {
        const entryName = oldPath.split("/").pop()!;
        oldParent = oldParent.filter((e: DirectoryEntry) => e.name !== entryName);
        await asPromise(oldParentStore.put(oldParent, oldParentPath));
      }
    }
    if (newParentPath) {
      await this.addEntryToParent(newPath, isDir, t);
    }
  }

  async _deleteFile(path: string, t?: IDBTransaction): Promise<void> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    const store = t.objectStore(this.STORE_NAME);
    await asPromise(store.delete(path));
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      const parentStore = t.objectStore(this.DIR_STORE_NAME);
      let parent = await asPromise(parentStore.get(parentPath));
      if (parent) {
        const entryName = path.split("/").pop()!;
        parent = parent.filter((e: DirectoryEntry) => e.name !== entryName);
        await asPromise(parentStore.put(parent, parentPath));
      }
    }
  }

  async _deleteDirectory(path: string, t?: IDBTransaction): Promise<void> {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    const store = await t.objectStore(this.DIR_STORE_NAME);
    await asPromise(store.delete(path));
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      const parentStore = await t.objectStore(this.DIR_STORE_NAME);
      let parent = await asPromise(parentStore.get(parentPath));
      if (parent) {
        const entryName = path.split("/").pop()!;
        parent = parent.filter((e: DirectoryEntry) => e.name !== entryName);
        await asPromise(parentStore.put(parent, parentPath));
      }
    }
  }

  async clear(t?: IDBTransaction) {
    if (!t) t = await this.getTransaction([this.STORE_NAME, this.DIR_STORE_NAME], "readwrite");
    const filesStore = t.objectStore(this.STORE_NAME);
    await asPromise(filesStore.clear());
    const dirsStore = t.objectStore(this.DIR_STORE_NAME);
    await asPromise(dirsStore.clear());
  }

  /**
   * 验证文件内容是否匹配
   * @param fs 文件系统实例
   * @param path 文件路径
   * @param expectedContent 预期内容
   */
  private static async verifyFileContent(
    fs: IndexedDBFileSystem,
    path: string,
    expectedContent: string,
  ): Promise<void> {
    const content = await fs.readFile(path);
    const actualContent = new TextDecoder("utf-8").decode(content);
    if (actualContent !== expectedContent) {
      throw new Error(
        `File content verification failed at ${path}\n` + `Expected: ${expectedContent}\n` + `Actual: ${actualContent}`,
      );
    }
  }

  /**
   * 测试IndexedDB文件系统功能
   * @param dbName 测试数据库名称
   * @param storeName 测试存储名称
   */
  static async testFileSystem(dbName: string, storeName: string): Promise<void> {
    const fs = new IndexedDBFileSystem(dbName, storeName);

    // 初始化数据库
    await fs.initDB();

    // 测试目录操作
    const testDirPath = "/test-dir";
    await fs.mkdir(testDirPath, true);
    console.log(`Created directory: ${testDirPath}`);

    // 测试文件操作
    const testFilePath = `${testDirPath}/test.txt`;
    const testContent = "Hello IndexedDB File System!";

    // 写入前验证文件不存在
    if (await fs.exists(testFilePath)) {
      throw new Error(`File already exists: ${testFilePath}`);
    }

    // 写入文件
    await fs.writeFile(testFilePath, testContent);
    console.log(`Wrote file: ${testFilePath}`);

    // 写入后验证内容
    await this.verifyFileContent(fs, testFilePath, testContent);
    console.log(`Verified file content: ${testFilePath}`);

    // 删除文件
    await fs.deleteFile(testFilePath);
    console.log(`Deleted file: ${testFilePath}`);

    // 删除目录
    await fs.deleteDirectory(testDirPath);
    console.log(`Deleted directory: ${testDirPath}`);

    // 清理测试数据库
    indexedDB.deleteDatabase(dbName);
    console.log(`Cleaned up test database: ${dbName}`);
  }
}
