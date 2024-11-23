import { getVersion } from "@tauri-apps/api/app";
import { load, Store } from "@tauri-apps/plugin-store";

export namespace LastLaunch {
  let store: Store;
  let version: string;

  export async function init() {
    store = await load("last_launch");
    version = (await store.get<string>("version")) || (await getVersion());
    await store.set("version", await getVersion());
  }
}
