import { createTarGzip, parseTarGzip } from "nanotar";
import { IndexedDBFileSystem } from "../../../utils/fs/IndexedDBFileSystem";
import { readFile, writeFile } from "../../../utils/fs/com";
import { StageDumper } from "../../stage/StageDumper";

export enum FSType {
  Tauri = "Tauri",
  WebFS = "WebFS",
  IndexedDB = "IndexedDB",
}
export namespace VFileSystem {
  const fs = new IndexedDBFileSystem("PG", "Project");
  export async function getMetaData() {
    return fs.readTextFile("/meta.json");
  }
  export async function setMetaData(content: string) {
    return fs.writeTextFile("/meta.json", content);
  }
  export async function pullMetaData() {
    setMetaData(JSON.stringify(StageDumper.dump()));
  }
  export async function loadFromPath(path: string) {
    await clear();
    const data = await readFile(path);
    const entries = await parseTarGzip(data);

    const operations: Promise<void>[] = [];

    for (const entry of entries) {
      const normalizedPath = entry.name.replace(/\/+/g, "/").replace(/\/$/, "");

      operations.push(
        (async () => {
          try {
            const lastSlashIndex = normalizedPath.lastIndexOf("/");
            const parentDir = lastSlashIndex >= 0 ? normalizedPath.slice(0, lastSlashIndex) : "";

            if (parentDir) {
              await fs.mkdir(parentDir, true);
            }
            if (!entry.data) {
              console.error(`Process file failed(data is empty): ${normalizedPath}`);
            }
            await fs.writeFile(normalizedPath, entry.data!);
          } catch (error) {
            console.error(`Process file failed: ${normalizedPath}`, error);
          }
        })(),
      );
    }

    await Promise.all(operations);
  }
  export async function saveToPath(path: string) {
    await setMetaData(JSON.stringify(StageDumper.dump()));
    await writeFile(path, await VFileSystem.exportZipData());
  }
  export async function exportZipData(): Promise<Uint8Array> {
    const startTime0 = performance.now();
    // 递归收集所有文件和目录
    async function collectFiles(path: string): Promise<{ path: string; content: Uint8Array }[]> {
      const entries = await fs.readDir(path);
      const files: { path: string; content: Uint8Array }[] = [];

      for (const entry of entries) {
        const fullPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.isDir) {
          // 递归处理子目录
          files.push(...(await collectFiles(fullPath)));
        } else {
          // 添加文件项
          const content = await fs.readFile(fullPath);
          //去除所有前导‘/’
          files.push({ path: fullPath.replace(/^\/+/, ""), content });
        }
      }

      return files;
    }

    // 收集所有文件
    const files = await collectFiles("/");
    console.log(
      files.map((file) => ({
        name: file.path,
        //data: file.content || new Uint8Array(0),
      })),
    );
    // 创建tar.gz文件
    const endTime0 = performance.now();
    console.log(`read from indexedDB:${endTime0 - startTime0}ms`);
    const startTime1 = performance.now();
    const edata = await createTarGzip(
      files.map((file) => ({
        name: file.path,
        data: file.content || new Uint8Array(0),
      })),
    );
    const endTime1 = performance.now();
    console.log(`create tar.gz:${endTime1 - startTime1}ms`);
    return edata;
  }
  export async function clear() {
    return fs.clear();
  }
  export function getFS() {
    return fs;
  }
}
