import { Vector } from "../dataStruct/Vector";
import { Camera } from "../stage/Camera";
import { APIMethods, apiValidators, PluginManifest, WorkerMessage } from "./types";

export class PluginWorker {
  private blobUrl: string;
  private worker: Worker;
  private allowedMethods: Array<keyof APIMethods>;

  constructor(code: string, manifest: PluginManifest) {
    // 把code转换成blob
    const blob = new Blob([code], { type: "text/javascript" });
    // 创建worker
    this.blobUrl = URL.createObjectURL(blob);
    this.worker = new Worker(this.blobUrl);
    this.allowedMethods = manifest.permissions;

    // worker接收到信息，判断是否为API调用
    this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, payload } = e.data;

      // 插件调用API
      if (type === "callAPIMethod") {
        const { method, args, reqId } = payload;

        // 校验API方法是否允许
        if (!this.allowedMethods.includes(method)) {
          this.worker.postMessage({
            type: "apiResponse",
            payload: {
              reqId,
              error: `Method "${method}" is not allowed by manifest`,
            },
          });
          return;
        }

        // 校验API方法参数是否合法
        const argsSchema = apiValidators[method];
        for (const [i, arg] of args.entries()) {
          const parseResult = argsSchema[i].safeParse(arg);
          if (!parseResult.success) {
            this.worker.postMessage({
              type: "apiResponse",
              payload: {
                reqId,
                error: `Argument ${i} of method "${method}" is not valid: ${parseResult.error.message}`,
              },
            });
            return;
          }
        }
        // 校验通过

        // 调用API方法
        if (method === "hello") {
          console.log("hello", args[0]);
        } else if (method === "getCameraLocation") {
          console.log();
        } else if (method === "setCameraLocation") {
          const [x, y] = args;
          // 设置相机位置
          Camera.location = new Vector(x, y);
        }
        this.worker.postMessage({
          type: "apiResponse",
          payload: {
            reqId,
            result: null,
          },
        });
      }
    };
  }

  destroy() {
    this.worker.terminate();
    URL.revokeObjectURL(this.blobUrl);
  }
}
