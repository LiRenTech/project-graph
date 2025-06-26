import { URI } from "vscode-uri";
import { Service, ServiceClass } from "./interfaces/Service";
import { CurveRenderer } from "./render/canvas2d/basicRenderer/curveRenderer";
import { ImageRenderer } from "./render/canvas2d/basicRenderer/ImageRenderer";
import { ShapeRenderer } from "./render/canvas2d/basicRenderer/shapeRenderer";
import { SvgRenderer } from "./render/canvas2d/basicRenderer/svgRenderer";
import { TextRenderer } from "./render/canvas2d/basicRenderer/textRenderer";
import { DrawingControllerRenderer } from "./render/canvas2d/controllerRenderer/drawingRenderer";
import { CollisionBoxRenderer } from "./render/canvas2d/entityRenderer/CollisionBoxRenderer";
import { StraightEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/StraightEdgeRenderer";
import { SymmetryCurveEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/SymmetryCurveEdgeRenderer";
import { VerticalPolyEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/VerticalPolyEdgeRenderer";
import { EdgeRenderer } from "./render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { EntityDetailsButtonRenderer } from "./render/canvas2d/entityRenderer/EntityDetailsButtonRenderer";
import { EntityRenderer } from "./render/canvas2d/entityRenderer/EntityRenderer";
import { MultiTargetUndirectedEdgeRenderer } from "./render/canvas2d/entityRenderer/multiTargetUndirectedEdge/MultiTargetUndirectedEdgeRenderer";
import { PortalNodeRenderer } from "./render/canvas2d/entityRenderer/portalNode/portalNodeRenderer";
import { SectionRenderer } from "./render/canvas2d/entityRenderer/section/SectionRenderer";
import { SvgNodeRenderer } from "./render/canvas2d/entityRenderer/svgNode/SvgNodeRenderer";
import { TextNodeRenderer } from "./render/canvas2d/entityRenderer/textNode/TextNodeRenderer";
import { UrlNodeRenderer } from "./render/canvas2d/entityRenderer/urlNode/urlNodeRenderer";
import { Renderer } from "./render/canvas2d/renderer";
import { BackgroundRenderer } from "./render/canvas2d/utilsRenderer/backgroundRenderer";
import { RenderUtils } from "./render/canvas2d/utilsRenderer/RenderUtils";
import { SearchContentHighlightRenderer } from "./render/canvas2d/utilsRenderer/searchContentHighlightRenderer";
import { WorldRenderUtils } from "./render/canvas2d/utilsRenderer/WorldRenderUtils";
import { InputElement } from "./render/domElement/inputElement";
import { AutoLayoutFastTree } from "./service/controlService/autoLayoutEngine/autoLayoutFastTreeMode";
import { AutoLayout } from "./service/controlService/autoLayoutEngine/mainTick";
import { ControllerUtils } from "./service/controlService/controller/concrete/utilsControl";
import { Controller } from "./service/controlService/controller/Controller";
import { KeyboardOnlyEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { KeyboardOnlyGraphEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyGraphEngine";
import { MouseLocation } from "./service/controlService/MouseLocation";
import { RectangleSelect } from "./service/controlService/rectangleSelectEngine/rectangleSelectEngine";
import { SecretKeys } from "./service/controlService/secretKeysEngine/secretKeysEngine";
import { AutoBackup } from "./service/dataFileService/autoSaveBackupEngine/autoBackupEngine";
import { AutoSave } from "./service/dataFileService/autoSaveBackupEngine/autoSaveEngine";
import { AutoCompute } from "./service/dataGenerateService/autoComputeEngine/mainTick";
import { StageExport } from "./service/dataGenerateService/stageExportEngine/stageExportEngine";
import { Effects } from "./service/feedbackService/effectEngine/effectMachine";
import { Camera } from "./stage/Camera";
import { Canvas } from "./stage/Canvas";
import { LayoutManualAlign } from "./stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import { StageAutoAlignManager } from "./stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageNodeRotate } from "./stage/stageManager/concreteMethods/stageNodeRotate";
import { StageManager } from "./stage/stageManager/StageManager";

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
    if (!service.id) {
      service.id = crypto.randomUUID();
      console.warn("服务 %o 未指定 ID，自动生成：%s", service, service.id);
    }
    const inst = new service(this);
    this.services.set(service.id, inst);
    if (Object.hasOwn(inst, "tick")) {
      this.tickableServices.add(inst);
    }
    this[service.id as keyof this] = inst as this[keyof this];
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

  /**
   * 获取某个服务的实例
   */
  getService<T extends keyof this & string>(serviceId: T): this[T] {
    return this.services.get(serviceId) as this[T];
  }
}

declare module "./Project" {
  /*
   * 不直接在class中定义的原因
   * 在class中定义的话ts会报错，因为它没有初始值并且没有在构造函数中赋值
   * 在这里用语法糖定义就能优雅的绕过这个限制
   */
  interface Project {
    // 最底层
    canvas: Canvas;
    inputElement: InputElement;
    // 数据管理
    stageManager: StageManager;
    camera: Camera;
    mouseLocation: MouseLocation;
    effects: Effects;
    autoCompute: AutoCompute;
    secretKeys: SecretKeys;
    autoBackup: AutoBackup;
    autoSave: AutoSave;
    stageExport: StageExport;
    rectangleSelect: RectangleSelect;
    stageNodeRotate: StageNodeRotate;
    // 自动布局算法
    autoLayout: AutoLayout;
    autoLayoutFastTree: AutoLayoutFastTree;
    layoutManualAlign: LayoutManualAlign;
    autoAlign: StageAutoAlignManager;
    // 纯键盘操作引擎
    keyboardOnlyEngine: KeyboardOnlyEngine;
    keyboardOnlyGraphEngine: KeyboardOnlyGraphEngine;
    // 渲染底层
    renderUtils: RenderUtils;
    worldRenderUtils: WorldRenderUtils;
    // 各种节点的渲染器
    textRenderer: TextRenderer;
    imageRenderer: ImageRenderer;
    shapeRenderer: ShapeRenderer;
    entityRenderer: EntityRenderer;
    edgeRenderer: EdgeRenderer;
    multiTargetUndirectedEdgeRenderer: MultiTargetUndirectedEdgeRenderer;
    curveRenderer: CurveRenderer;
    svgRenderer: SvgRenderer;
    drawingControllerRenderer: DrawingControllerRenderer;
    collisionBoxRenderer: CollisionBoxRenderer;
    entityDetailsButtonRenderer: EntityDetailsButtonRenderer;
    straightEdgeRenderer: StraightEdgeRenderer;
    symmetryCurveEdgeRenderer: SymmetryCurveEdgeRenderer;
    verticalPolyEdgeRenderer: VerticalPolyEdgeRenderer;
    portalNodeRenderer: PortalNodeRenderer;
    sectionRenderer: SectionRenderer;
    svgNodeRenderer: SvgNodeRenderer;
    textNodeRenderer: TextNodeRenderer;
    urlNodeRenderer: UrlNodeRenderer;
    backgroundRenderer: BackgroundRenderer;
    searchContentHighlightRenderer: SearchContentHighlightRenderer;
    // utils
    controllerUtils: ControllerUtils;
    // 最终呈现给用户的东西
    renderer: Renderer;
    controller: Controller;
  }
}

/**
 * 装饰器
 * @example
 * @service("renderer")
 * class Renderer {}
 */
export const service =
  (id: string) =>
  <
    T extends {
      [x: string | number | symbol]: any;
      id?: string;
      new (...args: any[]): any;
    },
  >(
    target: T,
  ): T & { id: string } => {
    target.id = id;
    return target as T & { id: string };
  };
