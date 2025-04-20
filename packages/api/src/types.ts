import { z } from "zod";

// 增加代码验证类型
export interface PluginPackage {
  code: string;
  manifest: PluginManifest;
}
// 定义允许插件调用的 API 方法类型
export const apiTypes = {
  hello: [[z.string()], z.void()],
  getCameraLocation: [[], z.tuple([z.number(), z.number()])],
  setCameraLocation: [[z.number(), z.number()], z.void()],
  getPressingKey: [[], z.array(z.string())],
  openDialog: [[z.string(), z.string()], z.void()],
} as const;

type Zod2Interface<T> = {
  [K in keyof T]: T[K] extends readonly [
    // 第一个元素：参数列表
    infer Args extends readonly z.ZodTypeAny[],
    // 第二个元素：返回值类型
    infer Return extends z.ZodTypeAny,
  ]
    ? (
        ...args: {
          // 对每个参数使用z.infer
          [L in keyof Args]: Args[L] extends z.ZodTypeAny ? z.infer<Args[L]> : never;
        }
      ) => z.infer<Return>
    : never;
};

export type Asyncize<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>;
export type AsyncizeInterface<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Asyncize<T[K]> : never;
};
export type SyncOrAsyncizeInterface<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Asyncize<T[K]> | T[K] : never;
};

export type PluginAPI = Zod2Interface<typeof apiTypes>;
export type PluginAPIMayAsync = SyncOrAsyncizeInterface<PluginAPI>;

// 消息通信协议类型

/**
 * 插件发送给主进程的消息类型
 */
export type CallAPIMessage = {
  type: "callAPIMethod";
  payload: {
    method: keyof typeof apiTypes;
    args: any[];
    reqId: string;
  };
};

/**
 * 主进程响应给插件的消息类型
 */
export type APIResponseMessage = {
  type: "apiResponse";
  payload: {
    reqId: string;
    result?: any;
    error?: string;
  };
};

export type WorkerMessage = CallAPIMessage | APIResponseMessage;

/**
 * 插件清单类型
 */
export interface PluginManifest {
  permissions: (keyof typeof apiTypes)[];
}
