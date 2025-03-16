import { z } from "zod";

// 增加代码验证类型
export interface PluginPackage {
  code: string;
  manifest: PluginManifest;
}
// 定义允许插件调用的 API 方法类型
export const apiValidators = {
  hello: [z.string()],
};
export interface APIMethods {
  hello: (name: string) => string;
}

// 消息通信协议类型
export type CallAPIMessage = {
  type: "callAPIMethod";
  payload: {
    method: keyof APIMethods;
    args: any[];
    reqId: string;
  };
};

export type APIResponseMessage = {
  type: "apiResponse";
  payload: {
    reqId: string;
    result?: any;
    error?: string;
  };
};

export type WorkerMessage = CallAPIMessage | APIResponseMessage;

// 插件清单类型
export interface PluginManifest {
  permissions: (keyof APIMethods)[];
}
