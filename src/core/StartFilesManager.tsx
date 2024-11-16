import { load, Store } from "@tauri-apps/plugin-store";

export namespace StartFilesManager {
  let store: Store;

  export type StartFile = {
    /**
     * 绝对路径
     */
    path: string;
    /**
     * 上次改动或打开的时间戳
     */
    time: number;
  };

  export async function init() {
    store = await load("start-files.json");
    store.save();
  }

  export async function clearStartFiles() {
    await store.set("startFiles", []);
    await store.set("currentStartFile", "");
    store.save();
    return true;
  }

  export async function getStartFiles(): Promise<StartFile[]> {
    const data = ((await store.get("startFiles")) as StartFile[]) || [];
    return data; // 返回最近文件列表
  }
  export async function getCurrentStartFile(): Promise<string> {
    return ((await store.get("currentStartFile")) as string) || ""; // 返回当前打开的文件
  }

  export async function setCurrentStartFile(filePath: string) {
    if (filePath === "") {
      return false; // 空路径不处理
    }
    let isFind = false;
    for (const file of await getStartFiles()) {
      if (file.path === filePath) {
        isFind = true;
        break;
      }
    }
    if (!isFind) {
      return false;
    }
    await store.set("currentStartFile", filePath);
    store.save();
    return true;
  }

  export async function addStartFile(filePath: string) {
    const existingFiles = await getStartFiles();
    for (const file of existingFiles) {
      if (file.path === filePath) {
        return false; // 文件已存在，不再添加
      }
    }
    existingFiles.push({
      path: filePath,
      time: Date.now(),
    });
    await store.set("startFiles", existingFiles);
    store.save();
    return true;
  }

  export async function removeStartFile(filePath: string) {
    const existingFiles = await getStartFiles();
    // 先检测有没有
    let isFind = false;
    for (const file of existingFiles) {
      if (file.path === filePath) {
        isFind = true;
        break;
      }
    }
    if (!isFind) {
      return false;
    }
    // 开始删除
    // 看看删掉的是不是已经选择的
    const currentFile = await getCurrentStartFile();
    if (currentFile === filePath) {
      await store.set("currentStartFile", "");
    }
    const newFiles = existingFiles.filter((file) => file.path !== filePath);
    await store.set("startFiles", newFiles);
    store.save();
    return true;
  }

  export function validateAndRefreshStartFiles() {}
}
