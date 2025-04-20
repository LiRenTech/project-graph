export namespace FeatureFlags {
  /**
   * 用户登录、注册以及所有和云服务有关的功能
   */
  export const USER = "LR_API_BASE_URL" in import.meta.env && "LR_TURNSTILE_SITE_KEY" in import.meta.env;
}
