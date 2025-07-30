import { Store } from "@tauri-apps/plugin-store";
import { createStore } from "@/utils/store";
import { FeatureFlags } from "@/core/service/FeatureFlags";

export namespace UserState {
  let store: Store;

  export async function init() {
    if (!FeatureFlags.USER) {
      return;
    }
    store = await createStore("user.json");
  }

  export async function getToken() {
    if (!FeatureFlags.USER) {
      return "";
    }
    return (await store.get<string>("token")) ?? "";
  }
  export async function setToken(token: string) {
    if (!FeatureFlags.USER) {
      return;
    }
    await store.set("token", token);
  }
}
