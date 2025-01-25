import { invoke } from "@tauri-apps/api/core";
import { IFileSystem, FileStats, DirectoryEntry } from "./IFileSystem";

/**
 * Tauri 文件系统工具类
 */
export class TauriFileSystem extends IFileSystem {
  async exists(path: string): Promise<boolean> {
    return invoke("exists", { path });
  }

  async readFile(path: string): Promise<Uint8Array> {
    return new Uint8Array(await invoke("read_file", { path }));
  }

  async writeFile(path: string, content: Uint8Array | string): Promise<void> {
    let data: Uint8Array;
    if (typeof content === "string") {
      data = new TextEncoder().encode(content);
    } else {
      data = content;
    }
    return invoke("write_file", {
      path,
      content: Array.from(data),
    });
  }

  async mkdir(path: string, recursive = false): Promise<void> {
    return invoke("mkdir", { path, recursive });
  }

  async stat(path: string): Promise<FileStats> {
    return invoke("stat", { path });
  }

  async readDir(path: string): Promise<DirectoryEntry[]> {
    return invoke("read_dir", { path });
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return invoke("rename", { oldPath, newPath });
  }

  async deleteFile(path: string): Promise<void> {
    return invoke("delete_file", { path });
  }

  async deleteDirectory(path: string): Promise<void> {
    return invoke("delete_directory", { path });
  }

  /**
   * 验证文件内容是否匹配
   * @param fs 文件系统实例
   * @param path 文件路径
   * @param expectedContent 预期内容
   */
  private static async verifyFileContent(
    fs: TauriFileSystem,
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
   * 测试Tauri文件系统功能
   * @param dirPath 要测试的目录路径
   */
  static async testFileSystem(dirPath: string): Promise<void> {
    const fs = new TauriFileSystem();

    // 测试目录操作
    await fs.mkdir(dirPath, true);
    console.log(`Created directory: ${dirPath}`);

    // 测试文件操作
    const testFilePath = `${dirPath}/test.txt`;
    const testContent = "Hello Tauri File System!";

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
    await fs.deleteDirectory(dirPath);
    console.log(`Deleted directory: ${dirPath}`);
  }
}
