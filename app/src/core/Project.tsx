import { Decoder, Encoder } from "@msgpack/msgpack";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { exists, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { URI } from "vscode-uri";
import { Serialized } from "../types/node";
import { Base64 } from "../utils/base64";
import { Service } from "./interfaces/Service";
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
import { KeyboardOnlyTreeEngine } from "./service/controlService/keyboardOnlyEngine/keyboardOnlyTreeEngine";
import { SelectChangeEngine } from "./service/controlService/keyboardOnlyEngine/selectChangeEngine";
import { RectangleSelect } from "./service/controlService/rectangleSelectEngine/rectangleSelectEngine";
import { SecretKeys } from "./service/controlService/secretKeysEngine/secretKeysEngine";
import { KeyBinds } from "./service/controlService/shortcutKeysEngine/KeyBinds";
import { KeyBindsRegistrar } from "./service/controlService/shortcutKeysEngine/shortcutKeysRegister";
import { MouseInteraction } from "./service/controlService/stageMouseInteractionCore/stageMouseInteractionCore";
import { AutoComputeUtils } from "./service/dataGenerateService/autoComputeEngine/AutoComputeUtils";
import { AutoCompute } from "./service/dataGenerateService/autoComputeEngine/mainTick";
import { GenerateFromFolder } from "./service/dataGenerateService/generateFromFolderEngine/GenerateFromFolderEngine";
import { StageExport } from "./service/dataGenerateService/stageExportEngine/stageExportEngine";
import { StageExportPng } from "./service/dataGenerateService/stageExportEngine/StageExportPng";
import { StageExportSvg } from "./service/dataGenerateService/stageExportEngine/StageExportSvg";
import { AI } from "./service/dataManageService/aiEngine/AIEngine";
import { ComplexityDetector } from "./service/dataManageService/ComplexityDetector";
import { ContentSearch } from "./service/dataManageService/contentSearchEngine/contentSearchEngine";
import { CopyEngine } from "./service/dataManageService/copyEngine/copyEngine";
import { Effects } from "./service/feedbackService/effectEngine/effectMachine";
import { Camera } from "./stage/Camera";
import { Canvas } from "./stage/Canvas";
import { ProjectFormatUpgrader } from "./stage/ProjectFormatUpgrader";
import { LayoutManualAlign } from "./stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import { AutoAlign } from "./stage/stageManager/concreteMethods/StageAutoAlignManager";
import { DeleteManager } from "./stage/stageManager/concreteMethods/StageDeleteManager";
import { EntityMoveManager } from "./stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageUtils } from "./stage/stageManager/concreteMethods/StageManagerUtils";
import { MultiTargetEdgeMove } from "./stage/stageManager/concreteMethods/StageMultiTargetEdgeMove";
import { NodeAdder } from "./stage/stageManager/concreteMethods/StageNodeAdder";
import { NodeConnector } from "./stage/stageManager/concreteMethods/StageNodeConnector";
import { StageNodeRotate } from "./stage/stageManager/concreteMethods/stageNodeRotate";
import { StageObjectColorManager } from "./stage/stageManager/concreteMethods/StageObjectColorManager";
import { StageObjectSelectCounter } from "./stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { SectionInOutManager } from "./stage/stageManager/concreteMethods/StageSectionInOutManager";
import { SectionPackManager } from "./stage/stageManager/concreteMethods/StageSectionPackManager";
import { SerializedDataAdder } from "./stage/stageManager/concreteMethods/StageSerializedAdder";
import { TagManager } from "./stage/stageManager/concreteMethods/StageTagManager";
import { StageManager } from "./stage/stageManager/StageManager";

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
  registerService(service: { id?: string; new (...args: any[]): any }) {
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

  private loop() {
    const animationFrame = () => {
      this.tick();
      this.rafHandle = requestAnimationFrame(animationFrame);
    };
    animationFrame();
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
   */
  interface Project {
    // 最底层
    canvas: Canvas;
    inputElement: InputElement;
    keyBinds: KeyBinds;
    // utils
    controllerUtils: ControllerUtils;
    autoComputeUtils: AutoComputeUtils;
    // 渲染底层
    renderUtils: RenderUtils;
    worldRenderUtils: WorldRenderUtils;
    // 数据管理
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
    // 自动布局算法
    autoLayout: AutoLayout;
    autoLayoutFastTree: AutoLayoutFastTree;
    layoutManualAlign: LayoutManualAlign;
    // 和stage相关的
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
    // 纯键盘操作引擎
    keyboardOnlyEngine: KeyboardOnlyEngine;
    keyboardOnlyGraphEngine: KeyboardOnlyGraphEngine;
    keyboardOnlyTreeEngine: KeyboardOnlyTreeEngine;
    selectChangeEngine: SelectChangeEngine;
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
    // 最终呈现给用户的东西
    renderer: Renderer;
    controller: Controller;
    // 导入导出
    stageExport: StageExport;
    stageExportPng: StageExportPng;
    StageExportSvg: StageExportSvg;
    generateFromFolder: GenerateFromFolder;
    serializedDataAdder: SerializedDataAdder;
    // 可以晚一点注册的服务
    keyBindsRegistrar: KeyBindsRegistrar;
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
