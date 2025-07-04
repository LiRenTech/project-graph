import { Decoder, Encoder } from "@msgpack/msgpack";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { exists, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { URI } from "vscode-uri";
import { Serialized } from "../types/node";
import { Base64 } from "../utils/base64";
import { Service } from "./interfaces/Service";
import type { CurveRenderer } from "./render/canvas2d/basicRenderer/curveRenderer";
import type { ImageRenderer } from "./render/canvas2d/basicRenderer/ImageRenderer";
import type { ShapeRenderer } from "./render/canvas2d/basicRenderer/shapeRenderer";
import type { SvgRenderer } from "./render/canvas2d/basicRenderer/svgRenderer";
import type { TextRenderer } from "./render/canvas2d/basicRenderer/textRenderer";
import type { DrawingControllerRenderer } from "./render/canvas2d/controllerRenderer/drawingRenderer";
import type { CollisionBoxRenderer } from "./render/canvas2d/entityRenderer/CollisionBoxRenderer";
import type { StraightEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/StraightEdgeRenderer";
import type { SymmetryCurveEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/SymmetryCurveEdgeRenderer";
import type { VerticalPolyEdgeRenderer } from "./render/canvas2d/entityRenderer/edge/concrete/VerticalPolyEdgeRenderer";
import type { EdgeRenderer } from "./render/canvas2d/entityRenderer/edge/EdgeRenderer";
import type { EntityDetailsButtonRenderer } from "./render/canvas2d/entityRenderer/EntityDetailsButtonRenderer";
import type { EntityRenderer } from "./render/canvas2d/entityRenderer/EntityRenderer";
import type { MultiTargetUndirectedEdgeRenderer } from "./render/canvas2d/entityRenderer/multiTargetUndirectedEdge/MultiTargetUndirectedEdgeRenderer";
import type { PortalNodeRenderer } from "./render/canvas2d/entityRenderer/portalNode/portalNodeRenderer";
import type { SectionRenderer } from "./render/canvas2d/entityRenderer/section/SectionRenderer";
import type { SvgNodeRenderer } from "./render/canvas2d/entityRenderer/svgNode/SvgNodeRenderer";
import type { TextNodeRenderer } from "./render/canvas2d/entityRenderer/textNode/TextNodeRenderer";
import type { UrlNodeRenderer } from "./render/canvas2d/entityRenderer/urlNode/urlNodeRenderer";
import type { Renderer } from "./render/canvas2d/renderer";
import type { BackgroundRenderer } from "./render/canvas2d/utilsRenderer/backgroundRenderer";
import type { RenderUtils } from "./render/canvas2d/utilsRenderer/RenderUtils";
import type { SearchContentHighlightRenderer } from "./render/canvas2d/utilsRenderer/searchContentHighlightRenderer";
import type { WorldRenderUtils } from "./render/canvas2d/utilsRenderer/WorldRenderUtils";
import type { InputElement } from "./render/domElement/inputElement";
import type { AutoLayoutFastTree } from "./service/controlService/autoLayoutEngine/autoLayoutFastTreeMode";
import type { AutoLayout } from "./service/controlService/autoLayoutEngine/mainTick";
import type { ControllerUtils } from "./service/controlService/controller/concrete/utilsControl";
import type { Controller } from "./service/controlService/controller/Controller";
import type { KeyboardOnlyEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import type { KeyboardOnlyGraphEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyGraphEngine";
import type { KeyboardOnlyTreeEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyTreeEngine";
import type { SelectChangeEngine } from "./service/controlService/keyboardOnlyEngine/selectChangeEngine";
import type { RectangleSelect } from "./service/controlService/rectangleSelectEngine/rectangleSelectEngine";
import type { SecretKeys } from "./service/controlService/secretKeysEngine/secretKeysEngine";
import type { KeyBinds } from "./service/controlService/shortcutKeysEngine/KeyBinds";
import type { KeyBindsRegistrar } from "./service/controlService/shortcutKeysEngine/shortcutKeysRegister";
import type { MouseInteraction } from "./service/controlService/stageMouseInteractionCore/stageMouseInteractionCore";
import type { AutoComputeUtils } from "./service/dataGenerateService/autoComputeEngine/AutoComputeUtils";
import type { AutoCompute } from "./service/dataGenerateService/autoComputeEngine/mainTick";
import type { GenerateFromFolder } from "./service/dataGenerateService/generateFromFolderEngine/GenerateFromFolderEngine";
import type { StageExport } from "./service/dataGenerateService/stageExportEngine/stageExportEngine";
import type { StageExportPng } from "./service/dataGenerateService/stageExportEngine/StageExportPng";
import type { StageExportSvg } from "./service/dataGenerateService/stageExportEngine/StageExportSvg";
import type { AI } from "./service/dataManageService/aiEngine/AIEngine";
import type { ComplexityDetector } from "./service/dataManageService/ComplexityDetector";
import type { ContentSearch } from "./service/dataManageService/contentSearchEngine/contentSearchEngine";
import type { CopyEngine } from "./service/dataManageService/copyEngine/copyEngine";
import type { Effects } from "./service/feedbackService/effectEngine/effectMachine";
import type { Camera } from "./stage/Camera";
import type { Canvas } from "./stage/Canvas";
import { ProjectFormatUpgrader } from "./stage/ProjectFormatUpgrader";
import type { LayoutManualAlign } from "./stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import type { AutoAlign } from "./stage/stageManager/concreteMethods/StageAutoAlignManager";
import type { DeleteManager } from "./stage/stageManager/concreteMethods/StageDeleteManager";
import type { EntityMoveManager } from "./stage/stageManager/concreteMethods/StageEntityMoveManager";
import type { StageUtils } from "./stage/stageManager/concreteMethods/StageManagerUtils";
import type { MultiTargetEdgeMove } from "./stage/stageManager/concreteMethods/StageMultiTargetEdgeMove";
import type { NodeAdder } from "./stage/stageManager/concreteMethods/StageNodeAdder";
import type { NodeConnector } from "./stage/stageManager/concreteMethods/StageNodeConnector";
import type { StageNodeRotate } from "./stage/stageManager/concreteMethods/stageNodeRotate";
import type { StageObjectColorManager } from "./stage/stageManager/concreteMethods/StageObjectColorManager";
import type { StageObjectSelectCounter } from "./stage/stageManager/concreteMethods/StageObjectSelectCounter";
import type { SectionInOutManager } from "./stage/stageManager/concreteMethods/StageSectionInOutManager";
import type { SectionPackManager } from "./stage/stageManager/concreteMethods/StageSectionPackManager";
import type { SerializedDataAdder } from "./stage/stageManager/concreteMethods/StageSerializedAdder";
import type { TagManager } from "./stage/stageManager/concreteMethods/StageTagManager";
import type { StageManager } from "./stage/stageManager/StageManager";

// TODO: 将filesystem接口提取出来
// TODO: 支持服务进行文件操作，而不是直接操作文件系统
// TODO: 删除文件路径相关的API
// TODO: 删除自动备份、自动保存
// TODO: 文档

/**
 * “工程”
 * 一个标签页对应一个工程，一个工程只能对应一个URI
 * 一个工程可以加载不同的服务，类似vscode的扩展（Extensions）机制
 */
export class Project {
  static readonly latestVersion = 17;

  private readonly services = new Map<string, Service>();
  private readonly tickableServices = new Set<Service>();
  private rafHandle = -1;
  private _uri: URI;
  private _state: ProjectState = ProjectState.Unsaved;
  private _data: Serialized.File = {
    version: Project.latestVersion,
    entities: [],
    associations: [],
    tags: [],
  };
  /**
   * 创建Encoder对象比直接用encode()快
   * @see https://github.com/msgpack/msgpack-javascript#reusing-encoder-and-decoder-instances
   */
  private encoder = new Encoder();
  private decoder = new Decoder();

  private constructor(
    /**
     * 工程文件的URI
     * 之所以从“路径”改为了“URI”，是因为要为后面的云同步功能做铺垫。
     * 普通的“路径”无法表示云盘中的文件，而URI可以。
     * 同时，草稿文件也从硬编码的“Project Graph”特殊文件路径改为了协议为draft、内容为UUID的URI。
     * @see https://code.visualstudio.com/api/references/vscode-api#workspace.workspaceFile
     */
    uri: URI,
  ) {
    this._uri = uri;
    console.log("new project", uri);
    (async () => {
      switch (this.uri.scheme) {
        case "file": {
          // 先检测之前有没有暂存
          const stashFilePath = await join(await appLocalDataDir(), "stash", Base64.encode(uri.toString()));
          if (await exists(stashFilePath)) {
            // 加载暂存的文件
            const decoded = this.decoder.decode(await readFile(stashFilePath)) as Record<string, any>;
            const upgraded = ProjectFormatUpgrader.upgrade(decoded);
            this._data = upgraded;
            this._state = ProjectState.Stashed;
          } else {
            // 加载原始文件
            const filePath = this.uri.fsPath;
            if (await exists(filePath)) {
              const decoded = this.decoder.decode(await readFile(filePath)) as Record<string, any>;
              const upgraded = ProjectFormatUpgrader.upgrade(decoded);
              this._data = upgraded;
              this._state = ProjectState.Saved;
            } else {
              // 这下真废了，新建一个空工程
            }
          }
          break;
        }
        case "draft": {
          break;
        }
        default: {
          break;
        }
      }
      console.log("start loop");
      this.loop();
    })();
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
  loadService(service: { id?: string; new (...args: any[]): any }) {
    if (!service.id) {
      service.id = crypto.randomUUID();
      console.warn("服务 %o 未指定 ID，自动生成：%s", service, service.id);
    }
    const inst = new service(this);
    this.services.set(service.id, inst);
    if ("tick" in inst) {
      console.log("服务 %s 实现了 tick()", service.id);
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

  private loop() {
    const animationFrame = () => {
      this.tick();
      this.rafHandle = requestAnimationFrame(animationFrame.bind(this));
    };
    animationFrame();
  }
  private tick() {
    for (const service of this.tickableServices) {
      try {
        service.tick?.();
      } catch (e) {
        console.error("[%s] %o", service, e);
        this.tickableServices.delete(service);
      }
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

  get isDraft() {
    return this.uri.scheme === "draft";
  }
  get uri() {
    return this._uri;
  }
  set uri(uri: URI) {
    this._uri = uri;
    this._state = ProjectState.Unsaved;
  }
  get state() {
    return this._state;
  }
  get data() {
    return this._data;
  }

  /**
   * 将文件暂存到数据目录中（通常为~/.local/share）
   * ~/.local/share/liren.project-graph/stash/<normalizedUri>
   * @see https://code.visualstudio.com/blogs/2016/11/30/hot-exit-in-insiders
   *
   * 频繁用msgpack序列化不会卡吗？
   * 虽然JSON.stringify()在V8上面速度和msgpack差不多
   * 但是要考虑跨平台，目前linux和macos用的都是webkit，目前还没有JavaScriptCore相关的benchmark
   * 而且考虑到以后会把图片也放进文件里面，JSON肯定不合适了
   * @see https://github.com/msgpack/msgpack-javascript#benchmark
   */
  async stash() {
    const stashFilePath = await join(await appLocalDataDir(), "stash", Base64.encode(this.uri.toString()));
    const encoded = this.encoder.encodeSharedRef(this.data);
    await writeFile(stashFilePath, encoded);
  }
  async save() {
    const encoded = this.encoder.encodeSharedRef(this.data);
    switch (this.uri.scheme) {
      case "file": {
        const filePath = this.uri.fsPath;
        await writeFile(filePath, encoded);
        this._state = ProjectState.Saved;
        break;
      }
      case "draft": {
        break;
      }
      default: {
        break;
      }
    }
  }
}

declare module "./Project" {
  /*
   * 不直接在class中定义的原因
   * 在class中定义的话ts会报错，因为它没有初始值并且没有在构造函数中赋值
   * 在这里用语法糖定义就能优雅的绕过这个限制
   * 服务加载的顺序在调用registerService()时确定
   */
  interface Project {
    canvas: Canvas;
    inputElement: InputElement;
    keyBinds: KeyBinds;
    controllerUtils: ControllerUtils;
    autoComputeUtils: AutoComputeUtils;
    renderUtils: RenderUtils;
    worldRenderUtils: WorldRenderUtils;
    stageManager: StageManager;
    camera: Camera;
    effects: Effects;
    autoCompute: AutoCompute;
    secretKeys: SecretKeys;
    rectangleSelect: RectangleSelect;
    stageNodeRotate: StageNodeRotate;
    complexityDetector: ComplexityDetector;
    ai: AI;
    copyEngine: CopyEngine;
    autoLayout: AutoLayout;
    autoLayoutFastTree: AutoLayoutFastTree;
    layoutManualAlign: LayoutManualAlign;
    autoAlign: AutoAlign;
    mouseInteraction: MouseInteraction;
    contentSearch: ContentSearch;
    deleteManager: DeleteManager;
    nodeAdder: NodeAdder;
    entityMoveManager: EntityMoveManager;
    stageUtils: StageUtils;
    multiTargetEdgeMove: MultiTargetEdgeMove;
    nodeConnector: NodeConnector;
    stageObjectColorManager: StageObjectColorManager;
    stageObjectSelectCounter: StageObjectSelectCounter;
    sectionInOutManager: SectionInOutManager;
    sectionPackManager: SectionPackManager;
    tagManager: TagManager;
    keyboardOnlyEngine: KeyboardOnlyEngine;
    keyboardOnlyGraphEngine: KeyboardOnlyGraphEngine;
    keyboardOnlyTreeEngine: KeyboardOnlyTreeEngine;
    selectChangeEngine: SelectChangeEngine;
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
    renderer: Renderer;
    controller: Controller;
    stageExport: StageExport;
    stageExportPng: StageExportPng;
    StageExportSvg: StageExportSvg;
    generateFromFolder: GenerateFromFolder;
    serializedDataAdder: SerializedDataAdder;
    keyBindsRegistrar: KeyBindsRegistrar;
    sectionMethods: SectionMethods;
  }
}

export enum ProjectState {
  /**
   * “已保存”
   * 已写入到原始文件中
   * 已上传到云端
   */
  Saved,
  /**
   * "已暂存"
   * 未写入到原始文件中，但是已经暂存到数据目录
   * 未上传到云端，但是已经暂存到本地
   */
  Stashed,
  /**
   * “未保存”
   * 未写入到原始文件中，也未暂存到数据目录（真·未保存）
   * 未上传到云端，也未暂存到本地
   */
  Unsaved,
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
