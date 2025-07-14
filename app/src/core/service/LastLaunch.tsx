import { Store } from "@tauri-apps/plugin-store";
import { Dialog } from "../../components/dialog";
import { getAppVersion } from "../../utils/otherApi";
import { createStore } from "../../utils/store";

export namespace LastLaunch {
  let store: Store;
  export let version: string;
  export let isFirstLaunch: boolean;

  export async function init() {
    store = await createStore("last_launch.json");
    version = (await store.get<string>("version")) ?? "";
    const currentVersion = await getAppVersion();
    if (version === "" && currentVersion.includes("foss")) {
      isFirstLaunch = true;
      Dialog.show({
        title: "你使用的是 FOSS 版本",
        content: "如果你没有特殊需求，建议下载正常版本（即文件名中不包含 `-foss` 字样的版本）",
        type: "warning",
      });
    }
    await store.set("version", currentVersion);
  }
}
