import { URI } from "vscode-uri";
import { Service, ServiceClass } from "./interfaces/Service";

/**
 * “工程”
 * 一个标签页对应一个工程，一个工程只能对应一个URI
 * @example
 * class ServiceImpl implements Service {
 *   static id = "impl";
 *   static dependencies: string[] = [];
 *   constructor(private readonly project: Project) {}
 *   tick() {}
 *   dispose() {}
 * }
 * const p = Project.newDraft();
 * p.registerService(ServiceImpl);
 */
export class Project {
  private readonly services = new Map<string, Service>();
  private readonly tickableServices = new Set<Service>();
  private rafHandle = -1;

  private constructor(
    /**
     * 工程文件的URI
     * 之所以从“路径”改为了“URI”，是因为要为后面的云同步功能做铺垫。
     * 普通的“路径”无法表示云盘中的文件，而URI可以。
     * 同时，草稿文件也从硬编码的“Project Graph”特殊文件路径改为了协议为draft、内容为UUID的URI。
     * @see https://code.visualstudio.com/api/references/vscode-api#workspace.workspaceFile
     */
    public readonly uri: URI,
  ) {
    const animationFrame = () => {
      this.tick();
      this.rafHandle = requestAnimationFrame(animationFrame);
    };
    animationFrame();
  }
  /**
   * 创建一个草稿工程
   * URI为draft:UUID
   */
  static newDraft(): Project {
    const uri = URI.parse("draft:" + crypto.randomUUID());
    return new Project(uri);
  }

  /**
   * 立刻加载一个新的服务
   */
  registerService(service: ServiceClass) {
    const inst = new service(this);
    this.services.set(service.id, inst);
    if (Object.hasOwn(inst, "tick")) {
      this.tickableServices.add(inst);
    }
  }
  /**
   * 立刻销毁一个服务
   */
  disposeService(serviceId: string) {
    const service = this.services.get(serviceId);
    if (service) {
      service.dispose?.();
      this.services.delete(serviceId);
      this.tickableServices.delete(service);
    }
  }

  private tick() {
    for (const service of this.tickableServices) {
      service.tick?.();
    }
  }
  /**
   * 用户关闭标签页时，销毁工程
   */
  async dispose() {
    cancelAnimationFrame(this.rafHandle);
    const promises: Promise<void>[] = [];
    for (const service of this.services.values()) {
      const result = service.dispose?.();
      if (result instanceof Promise) {
        promises.push(result);
      }
    }
    await Promise.allSettled(promises);
    this.services.clear();
    this.tickableServices.clear();
  }
}
