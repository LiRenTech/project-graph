import { invoke } from "@tauri-apps/api/core";

/**
 * API密钥管理相关
 */
export namespace ApiKeyManager {
  export async function getKey(keyName: string): Promise<string> {
    return await invoke<"string">("get_env_value", {
      envName: keyName,
    });
  }

  export async function setKey(keyName: string, keyValue: string) {
    await invoke<"string">("set_env_value", {
      envName: keyName,
      envValue: keyValue,
    });
  }

  export function removeKey(keyName: string) {
    console.log(keyName);
  }

  export function isKeyExists(keyName: string): boolean {
    return !!import.meta.env[keyName];
  }
}
