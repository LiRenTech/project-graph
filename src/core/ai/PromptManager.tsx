import { Store } from "@tauri-apps/plugin-store";
import { createStore } from "../../utils/store";

/**
 * 管理用户提示词
 */
export namespace PromptManager {
  let store: Store;

  export async function init() {
    store = await createStore("prompt-manager.json");
    const oldList = ((await store.get("user-prompts")) as string[]) || [];
    if (oldList.length === 0) {
      // 给用户一些默认的提示词
      await addUserPrompt(
        "我的词是：{{nodeText}}，你会扩展出5~10个新的词。每个词之间用换行符分隔",
      );
    }
    store.save();
  }

  export async function getCurrentUserPrompt(): Promise<string> {
    return ((await store.get("current-user-prompt")) as string) || "";
  }

  export async function setCurrentUserPrompt(prompt: string) {
    await store.set("current-user-prompt", prompt);
    store.save();
  }

  export async function getUserPromptList(): Promise<string[]> {
    const data = ((await store.get("user-prompts")) as string[]) || [];
    return data;
  }

  export async function addUserPrompt(prompt: string) {
    const data = ((await store.get("user-prompts")) as string[]) || [];
    data.push(prompt);
    await store.set("user-prompts", data);
    store.save();
  }

  export async function deleteUserPrompt(prompt: string) {
    const data = ((await store.get("user-prompts")) as string[]) || [];
    const index = data.indexOf(prompt);
    if (index > -1) {
      data.splice(index, 1);
      await store.set("user-prompts", data);
      store.save();
    }
  }

  export async function editUserPrompt(oldPrompt: string, newPrompt: string) {
    const data = ((await store.get("user-prompts")) as string[]) || [];
    const index = data.indexOf(oldPrompt);
    if (index > -1) {
      data[index] = newPrompt;
      await store.set("user-prompts", data);
      store.save();
    }
  }
}
