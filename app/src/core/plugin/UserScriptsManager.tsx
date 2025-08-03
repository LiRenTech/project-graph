import { parsePluginCode, PluginCodeParseData } from "@/core/plugin/PluginCodeParseData";
import { PluginWorker } from "@/core/plugin/PluginWorker";
import { getAllAPIMethods } from "@/core/plugin/types";
import { createStore } from "@/utils/store";
import { exists, readTextFile } from "@tauri-apps/plugin-fs";
import { Store } from "@tauri-apps/plugin-store";
import { toast } from "sonner";

/**
 * 用户脚本管理器
 * 小插件
 */
export namespace UserScriptsManager {
  let store: Store;

  export type UserScriptFile = {
    /**
     * 绝对路径
     */
    path: string;
    /**
     * 是否启用
     */
    enabled: boolean;

    scriptData: PluginCodeParseData;
  };

  const runningScripts: { [key: string]: PluginWorker } = {};

  export async function init() {
    store = await createStore("user-scripts.json");
    store.save();

    // 延迟一小点时间，并开始加载并运行用户脚本
    setTimeout(() => {
      startRunUserScripts();
    }, 1000);
  }

  /**
   * 开始加载并运行用户脚本
   */
  export async function startRunUserScripts() {
    await validAndRefresh();
    const files = await getAllUserScripts();
    for (const file of files) {
      if (!file.enabled) {
        continue;
      }
      enableUserScript(file.path);
    }
  }

  /**
   * 开启某个脚本的运行
   * @param filePath 已经在上游确保是存在的脚本路径
   */
  async function enableUserScript(filePath: string) {
    const code = await readTextFile(filePath);
    const pluginWorker = new PluginWorker(code, {
      permissions: getAllAPIMethods(),
    });
    runningScripts[filePath] = pluginWorker;
  }

  /**
   * 关闭某个脚本的运行
   * @param filePath
   */
  async function disableUserScript(filePath: string) {
    if (runningScripts[filePath]) {
      runningScripts[filePath].destroy();
      delete runningScripts[filePath];
    }
  }

  /**
   * 重新解析全部脚本文件
   */
  export async function validAndRefresh() {
    const files = await getAllUserScripts();
    const validFiles: UserScriptFile[] = [];
    const lostFiles: string[] = [];

    for (const file of files) {
      if (!exists(file.path)) {
        // 这个文件丢了
        lostFiles.push(file.path);
        continue;
      }

      const { data, error, success } = parsePluginCode(await readTextFile(file.path));
      if (success) {
        validFiles.push({
          path: file.path,
          enabled: file.enabled,
          scriptData: data,
        });
      } else {
        lostFiles.push(file.path);
        toast.error(`解析脚本失败：${file.path}\n${error}`);
      }
    }

    await store.set("userScripts", validFiles); // 更新存储
    await store.save();
  }
  /**
   * 获取所有用户脚本文件
   * @returns
   */
  export async function getAllUserScripts(): Promise<UserScriptFile[]> {
    const data = ((await store.get("userScripts")) as UserScriptFile[]) || [];
    return data;
  }

  /**
   * 添加用户脚本文件，内置了解析脚本功能
   * @param filePath 文件绝对路径
   * @returns
   */
  export async function addUserScript(filePath: string) {
    const existingFiles = await getAllUserScripts();
    for (const file of existingFiles) {
      if (file.path === filePath) {
        return false; // 文件已存在，不再添加
      }
    }
    // 解析脚本
    const code = await readTextFile(filePath);
    const { data, error, success } = parsePluginCode(code);
    if (!success) {
      toast.error(`解析脚本失败：${filePath}\n${error}`);
      return false;
    }

    existingFiles.push({
      path: filePath,
      enabled: true,
      scriptData: data,
    });
    await store.set("userScripts", existingFiles);
    await store.save();
    return true;
  }

  export async function checkoutUserScriptEnabled(filePath: string, enabled: boolean) {
    const existingFiles = (await store.get("userScripts")) as UserScriptFile[];
    for (const file of existingFiles) {
      if (file.path === filePath) {
        file.enabled = enabled;
        if (enabled) {
          // 用户关闭了某个正在运行的脚本
          disableUserScript(filePath);
          toast.success(`脚本已关闭：${filePath}`);
        } else {
          // 用户开启了某个脚本
          if (runningScripts[filePath]) {
            toast.warning(`脚本正在运行中，请先关闭：${filePath}`);
          } else {
            enableUserScript(filePath);
            toast.success(`脚本已开启：${filePath}`);
          }
        }
        break;
      }
    }
    store.set("userScripts", existingFiles);
    store.save();
  }

  export async function removeUserScript(filePath: string) {
    const existingFiles = await getAllUserScripts();
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
    // 先确保关闭
    disableUserScript(filePath);
    // 开始删除
    const newFiles = existingFiles.filter((file) => file.path !== filePath);
    await store.set("userScripts", newFiles);
    await store.save();
    return true;
  }
}
