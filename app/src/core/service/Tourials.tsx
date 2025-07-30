import { Store } from "@tauri-apps/plugin-store";
import { createStore } from "@/utils/store";

/**
 * 教程记录
 */
export namespace Tourials {
  export const tourials = ["nodeDetailsEditor"] as const;

  let store: Store | null = null;

  // 只在最初始时创建一次
  export async function init() {
    store = await createStore("tourials.json");
  }

  export async function finish(tourial: (typeof tourials)[number]) {
    await store?.set(tourial, true);
    await store?.save();
  }

  export async function reset() {
    await store?.clear();
    await store?.save();
  }

  export async function tour(tourial: (typeof tourials)[number], fn: () => void | Promise<void>) {
    if (await store?.get(tourial)) {
      return;
    }
    await fn();
    await finish(tourial);
  }
}
