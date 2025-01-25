import {
  IFileSystem,
  type FileStats,
  type DirectoryEntry,
} from "./IFileSystem";

const DB_VERSION = 1;

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
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(
          this,
          db.objectStoreNames.contains(this.STORE_NAME),
          db.objectStoreNames.contains(this.DIR_STORE_NAME),
        );
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: "path" });
        }
        if (!db.objectStoreNames.contains(this.DIR_STORE_NAME)) {
          db.createObjectStore(this.DIR_STORE_NAME, { keyPath: "path" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
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

  async exists(path: string): Promise<boolean> {
    if (!this.db) {
      await this.initDB();
    }
    const transaction = await this.getTransaction(
      [this.STORE_NAME, this.DIR_STORE_NAME],
      "readwrite",
    );
    const filesStore = transaction.objectStore(this.STORE_NAME);
    const dirsStore = transaction.objectStore(this.DIR_STORE_NAME);

    return new Promise((resolve) => {
      const request = filesStore.get(path);
      request.onsuccess = () => {
        if (request.result) {
          resolve(true);
        } else {
          const dirRequest = dirsStore.get(path);
          dirRequest.onsuccess = () => resolve(!!dirRequest.result);
          dirRequest.onerror = () => resolve(false);
        }
      };
      request.onerror = () => resolve(false);
    });
  }

  async readFile(path: string): Promise<Uint8Array> {
    const store = await this.getStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.content);
        } else {
          reject(new Error(`File not found: ${path}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async writeFile(path: string, content: Uint8Array | string): Promise<void> {
    const store = await this.getStore(this.STORE_NAME, "readwrite");
    const data =
      typeof content === "string" ? new TextEncoder().encode(content) : content;

    return new Promise((resolve, reject) => {
      const request = store.put({ path, content: data });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async readDir(path: string): Promise<DirectoryEntry[]> {
    const store = await this.getStore(this.DIR_STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.entries);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async mkdir(path: string, recursive = false): Promise<void> {
    if (!recursive) {
      const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
      return new Promise((resolve, reject) => {
        const request = store.put({ path, entries: [] });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    // 递归创建父目录
    const parts = path.split("/");
    let currentPath = "";
    const pathsToCreate: string[] = [];

    // 收集需要创建的路径
    for (const part of parts) {
      if (!part) continue;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!(await this.exists(currentPath))) {
        pathsToCreate.push(currentPath);
      }
    }

    // 在单个事务中创建所有目录
    if (pathsToCreate.length > 0) {
      const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
      return new Promise((resolve, reject) => {
        let completed = 0;
        let error: IDBRequest | null = null;

        for (const path of pathsToCreate) {
          const request = store.put({ path, entries: [] });
          request.onsuccess = () => {
            completed++;
            if (completed === pathsToCreate.length && !error) {
              resolve();
            }
          };
          request.onerror = () => {
            if (!error) {
              error = request;
              reject(request.error);
            }
          };
        }
      });
    }
  }

  async stat(path: string): Promise<FileStats> {
    const filesStore = await this.getStore(this.STORE_NAME);
    const dirsStore = await this.getStore(this.DIR_STORE_NAME);

    return new Promise((resolve, reject) => {
      const fileRequest = filesStore.get(path);
      fileRequest.onsuccess = () => {
        if (fileRequest.result) {
          resolve({
            name: path.split("/").pop() || "",
            isDir: false,
            size: fileRequest.result.content.byteLength,
            modified: new Date(),
          });
        } else {
          const dirRequest = dirsStore.get(path);
          dirRequest.onsuccess = () => {
            if (dirRequest.result) {
              resolve({
                name: path.split("/").pop() || "",
                isDir: true,
                size: 0,
                modified: new Date(),
              });
            } else {
              reject(new Error(`Path not found: ${path}`));
            }
          };
        }
      };
    });
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const filesStore = await this.getStore(this.STORE_NAME, "readwrite");
    const dirsStore = await this.getStore(this.DIR_STORE_NAME, "readwrite");

    return new Promise((resolve, reject) => {
      const moveFile = () => {
        const request = filesStore.get(oldPath);
        request.onsuccess = () => {
          if (request.result) {
            const content = request.result.content;
            const deleteRequest = filesStore.delete(oldPath);
            deleteRequest.onsuccess = () => {
              const putRequest = filesStore.put({ path: newPath, content });
              putRequest.onsuccess = () => resolve();
              putRequest.onerror = () => reject(putRequest.error);
            };
          } else {
            moveDir();
          }
        };
      };

      const moveDir = () => {
        const request = dirsStore.get(oldPath);
        request.onsuccess = () => {
          if (request.result) {
            const entries = request.result.entries;
            const deleteRequest = dirsStore.delete(oldPath);
            deleteRequest.onsuccess = () => {
              const putRequest = dirsStore.put({ path: newPath, entries });
              putRequest.onsuccess = () => resolve();
              putRequest.onerror = () => reject(putRequest.error);
            };
          } else {
            reject(new Error(`Path not found: ${oldPath}`));
          }
        };
      };

      moveFile();
    });
  }

  async deleteFile(path: string): Promise<void> {
    const store = await this.getStore(this.STORE_NAME, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(path);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDirectory(path: string): Promise<void> {
    const store = await this.getStore(this.DIR_STORE_NAME, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(path);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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
