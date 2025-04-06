import { z } from "zod";

// 增加代码验证类型
export interface PluginPackage {
  code: string;
  manifest: PluginManifest;
}
// 定义允许插件调用的 API 方法类型
export const apiValidators = {
  hello: [z.string()],
  getCameraLocation: [],
  setCameraLocation: [z.number(), z.number()],
  // 这里可能会有超多内容
  // ....
  // ....
  // ....
};

/**
 * 这里列举所有允许插件调用的 API 方法
 */
export interface APIMethods {
  hello: (name: string) => string;
  getCameraLocation: () => { x: number; y: number };
  setCameraLocation: (x: number, y: number) => void;
  // 这里可能会有超多内容
  // ....
  // ....
  // ....
}

// 消息通信协议类型

/**
 * 插件发送给主进程的消息类型
 */
export type CallAPIMessage = {
  type: "callAPIMethod";
  payload: {
    method: keyof APIMethods;
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
  permissions: (keyof APIMethods)[];
}
