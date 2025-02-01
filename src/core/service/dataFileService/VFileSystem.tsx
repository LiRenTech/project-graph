import JSZip, * as jszip from "jszip";
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
    const data = await readFile(path);
    const zip = await jszip.loadAsync(data);
    const entries = zip.files;

    const operations: Promise<void>[] = [];

    for (const [rawPath, file] of Object.entries(entries)) {
      // 标准化路径：替换多个斜杠为单个，并移除末尾斜杠
      const normalizedPath = rawPath.replace(/\/+/g, "/").replace(/\/$/, "");

      if (file.dir) {
        await fs.mkdir(normalizedPath, true);
      } else {
        // 处理文件
        operations.push(
          (async () => {
            try {
              // 分离目录和文件名
              const lastSlashIndex = normalizedPath.lastIndexOf("/");
              const parentDir = lastSlashIndex >= 0 ? normalizedPath.slice(0, lastSlashIndex) : "";

              // 创建父目录（如果存在）
              if (parentDir) {
                await fs.mkdir(parentDir, true);
              }

              // 写入文件内容
              const content = await file.async("uint8array");
              await fs.writeFile(normalizedPath, content);
            } catch (error) {
              console.error(`Process file failed: ${normalizedPath}`, error);
            }
          })(),
        );
      }
    }

    await Promise.all(operations);
  }
  export async function saveToPath(path: string) {
    await setMetaData(JSON.stringify(StageDumper.dump()));
    await writeFile(path, await VFileSystem.exportZipData());
  }
  export async function exportZipData(): Promise<Uint8Array> {
    const zip = new JSZip();

    // 递归添加目录和文件到zip
    async function addToZip(zipParent: jszip, path: string) {
      console.log(zipParent, path);
      const entries = await fs.readDir(path);

      for (const entry of entries) {
        const fullPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.isDir) {
          // 创建目录节点并递归处理子项
          const dirZip = zipParent.folder(entry.name);
          await addToZip(dirZip!, fullPath);
        } else {
          // 添加文件内容到zip
          const content = await fs.readFile(fullPath);
          zipParent.file(entry.name, content);
        }
      }
    }

    // 从根目录开始处理
    await addToZip(zip, "/");

    // 生成zip文件内容
    return zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE", // 使用压缩
      compressionOptions: { level: 6 },
    });
  }
  export function getFS() {
    return fs;
  }
}
