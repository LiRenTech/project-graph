import { Store } from "@tauri-apps/plugin-store";
import { getVersion } from "../utils/otherApi";
import { createStore } from "../utils/store";

export namespace LastLaunch {
  let store: Store;
  export let version: string;

  export async function init() {
    store = await createStore("last_launch");
    version = (await store.get<string>("version")) || (await getVersion());
    await store.set("version", await getVersion());
  }
}
