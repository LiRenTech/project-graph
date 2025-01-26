/**
 * API密钥管理相关
 */
export namespace ApiKeyManager {
  export function getKeyArk(): string {
    return import.meta.env.LR_ARK_API_KEY ?? "";
  }

  export function getKeyCF(): string {
    return import.meta.env.LR_CF_API_KEY ?? "";
  }
}
