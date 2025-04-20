import { Asyncize, PluginAPI } from "./types";

export function api<T extends keyof PluginAPI>(method: T): Asyncize<PluginAPI[T]> {
  return (...args: Parameters<PluginAPI[T]>) => {
    return new Promise<ReturnType<PluginAPI[T]>>((resolve, reject) => {
      const reqId = crypto.randomUUID();
      window.postMessage(
        {
          type: "callAPIMethod",
          payload: { reqId, method, args },
        },
        "*",
      );
      const handler = (event: MessageEvent) => {
        const { type, payload } = event.data;
        if (type === "apiResponse") {
          if (payload.reqId === reqId) {
            if (payload.success) {
              resolve(payload.result);
            } else {
              reject(payload.result);
            }
            window.removeEventListener("message", handler);
          }
        }
      };
      window.addEventListener("message", handler);
    });
  };
}

export { Camera } from "./apis/camera";
export { Controller } from "./apis/controller";
export { Dialog } from "./apis/dialog";
