import {
  IFileSystem,
  type FileStats,
  type DirectoryEntry,
} from "./IFileSystem";

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
        db.createObjectStore(this.STORE_NAME, { keyPath: "path" });
      }
      if (!db.objectStoreNames.contains(this.DIR_STORE_NAME)) {
        db.createObjectStore(this.DIR_STORE_NAME, { keyPath: "path" });
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

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly",
  ): Promise<IDBObjectStore> {
    const transaction = await this.getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

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

  private async addEntryToParent(
    childPath: string,
    isDir: boolean,
  ): Promise<void> {
    const parentPath = this.getParentPath(childPath);
    if (!parentPath) return;

    // 确保父目录存在（递归创建）
    if (!(await this._exists(parentPath))) {
      await this._mkdir(parentPath, true);
    }

    const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
    const parentDir = await asPromise(store.get(parentPath));
    const childName = childPath.split("/").pop()!;

    if (!parentDir) {
      throw new Error(`Parent directory ${parentPath} not found`);
    }

    const exists = parentDir.entries.some(
      (e: DirectoryEntry) => e.name === childName,
    );
    if (!exists) {
      parentDir.entries.push({ name: childName, isDir });
      await asPromise(store.put(parentDir));
    }
  }

  async _exists(path: string): Promise<boolean> {
    path = this.normalizePath(path);
    const trans = await this.getTransaction(
      [this.STORE_NAME, this.DIR_STORE_NAME],
      "readonly",
    );
    const fileExists = !!(await asPromise(
      trans.objectStore(this.STORE_NAME).get(path),
    ));
    if (fileExists) return true;
    return !!(await asPromise(
      trans.objectStore(this.DIR_STORE_NAME).get(path),
    ));
  }

  async _readFile(path: string): Promise<Uint8Array> {
    const store = await this.getStore(this.STORE_NAME);
    const result = await asPromise(store.get(path));
    if (result) return result.content;
    throw new Error(`File not found: ${path}`);
  }

  async _mkdir(path: string, recursive = false): Promise<void> {
    path = this.normalizePath(path);
    if (path === "/") {
      const exists = await this._exists("/");
      if (!exists) {
        const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
        await asPromise(store.put({ path: "/", entries: [] }));
      }
      return;
    }

    if (!recursive) {
      const parentPath = this.getParentPath(path);
      if (parentPath && !(await this._exists(parentPath))) {
        throw new Error(`Parent directory does not exist: ${parentPath}`);
      }
      const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
      await asPromise(store.put({ path, entries: [] }));
      if (parentPath) await this.addEntryToParent(path, true);
      return;
    }

    const parts = path.split("/").filter((p) => p !== "");
    let currentPath = "";
    const pathsToCreate: string[] = [];
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
      currentPath = this.normalizePath(currentPath);
      if (!(await this._exists(currentPath))) {
        pathsToCreate.push(currentPath);
      }
    }

    const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
    for (const p of pathsToCreate) {
      await asPromise(store.put({ path: p, entries: [] }));
      await this.addEntryToParent(p, true);
    }
  }

  async _writeFile(path: string, content: Uint8Array | string): Promise<void> {
    path = this.normalizePath(path);
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      await this._mkdir(parentPath, true);
    }

    const store = await this.getStore(this.STORE_NAME, "readwrite");
    const data =
      typeof content === "string" ? new TextEncoder().encode(content) : content;
    await asPromise(store.put({ path, content: data }));
    await this.addEntryToParent(path, false);
  }

  async _readDir(path: string): Promise<DirectoryEntry[]> {
    path = this.normalizePath(path);
    const store = await this.getStore(this.DIR_STORE_NAME);
    const dirEntry = await asPromise(store.get(path));
    if (!dirEntry) {
      throw new Error(`Directory not found: ${path}`);
    }
    return dirEntry.entries;
  }

  async _stat(path: string): Promise<FileStats> {
    const fileStore = await this.getStore(this.STORE_NAME);
    const dirStore = await this.getStore(this.DIR_STORE_NAME);
    const file = await asPromise(fileStore.get(path));
    if (file) {
      return {
        name: path.split("/").pop() || "",
        isDir: false,
        size: file.content.byteLength,
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

  async _rename(oldPath: string, newPath: string): Promise<void> {
    oldPath = this.normalizePath(oldPath);
    newPath = this.normalizePath(newPath);
    const transaction = await this.getTransaction(
      [this.STORE_NAME, this.DIR_STORE_NAME],
      "readwrite",
    );
    const filesStore = transaction.objectStore(this.STORE_NAME);
    const dirsStore = transaction.objectStore(this.DIR_STORE_NAME);

    const isDir = !!(await asPromise(dirsStore.get(oldPath)));
    if (isDir) {
      // 处理目录重命名及子项
      const dir = await asPromise(dirsStore.get(oldPath));
      if (!dir) throw new Error(`Directory not found: ${oldPath}`);
      await asPromise(dirsStore.delete(oldPath));
      await asPromise(dirsStore.put({ ...dir, path: newPath }));

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
              await asPromise(
                filesStore.put({ ...cursor.value, path: newChildPath }),
              );
            } else {
              await asPromise(dirsStore.delete(oldChildPath));
              await asPromise(
                dirsStore.put({ ...cursor.value, path: newChildPath }),
              );
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
      await asPromise(filesStore.put({ ...file, path: newPath }));
    }

    // 更新父目录条目
    const oldParentPath = this.getParentPath(oldPath);
    const newParentPath = this.getParentPath(newPath);
    if (oldParentPath) {
      const oldParentStore = await this.getStore(
        this.DIR_STORE_NAME,
        "readwrite",
      );
      const oldParent = await asPromise(oldParentStore.get(oldParentPath));
      if (oldParent) {
        const entryName = oldPath.split("/").pop()!;
        oldParent.entries = oldParent.entries.filter(
          (e: DirectoryEntry) => e.name !== entryName,
        );
        await asPromise(oldParentStore.put(oldParent));
      }
    }
    if (newParentPath) {
      await this.addEntryToParent(newPath, isDir);
    }
  }

  async _deleteFile(path: string): Promise<void> {
    const store = await this.getStore(this.STORE_NAME, "readwrite");
    await asPromise(store.delete(path));
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      const parentStore = await this.getStore(this.DIR_STORE_NAME, "readwrite");
      const parent = await asPromise(parentStore.get(parentPath));
      if (parent) {
        const entryName = path.split("/").pop()!;
        parent.entries = parent.entries.filter(
          (e: DirectoryEntry) => e.name !== entryName,
        );
        await asPromise(parentStore.put(parent));
      }
    }
  }

  async _deleteDirectory(path: string): Promise<void> {
    const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
    await asPromise(store.delete(path));
    const parentPath = this.getParentPath(path);
    if (parentPath) {
      const parentStore = await this.getStore(this.DIR_STORE_NAME, "readwrite");
      const parent = await asPromise(parentStore.get(parentPath));
      if (parent) {
        const entryName = path.split("/").pop()!;
        parent.entries = parent.entries.filter(
          (e: DirectoryEntry) => e.name !== entryName,
        );
        await asPromise(parentStore.put(parent));
      }
    }
  }

  async clear() {
    const transaction = await this.getTransaction(
      [this.STORE_NAME, this.DIR_STORE_NAME],
      "readwrite",
    );
    const filesStore = transaction.objectStore(this.STORE_NAME);
    const dirsStore = transaction.objectStore(this.DIR_STORE_NAME);
    return new Promise<void>((resolve, reject) => {
      const r0 = filesStore.clear();
      r0.onsuccess = () => {
        const r2 = dirsStore.clear();
        r2.onsuccess = () => resolve();
        r2.onerror = () => reject();
      };
      r0.onerror = () => reject();
    });
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
        `File content verification failed at ${path}\n` +
          `Expected: ${expectedContent}\n` +
          `Actual: ${actualContent}`,
      );
    }
  }

  /**
   * 测试IndexedDB文件系统功能
   * @param dbName 测试数据库名称
   * @param storeName 测试存储名称
   */
  static async testFileSystem(
    dbName: string,
    storeName: string,
  ): Promise<void> {
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
