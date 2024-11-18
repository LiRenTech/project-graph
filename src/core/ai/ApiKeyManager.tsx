/**
 * API密钥管理相关
 */
export namespace ApiKeyManager {
  export function getKey(): string {
    return import.meta.env.LR_ARK_API_KEY ?? "";
  }
}
