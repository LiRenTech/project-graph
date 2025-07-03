import { File, FileDown, FilePlus, FolderOpen, Save } from "lucide-react";
import Renderer from "markdown-it/lib/renderer.mjs";
import { ReactNode } from "react";
import { projectsAtom, store } from "../../state";
import { Project } from "../Project";
import { CurveRenderer } from "../render/canvas2d/basicRenderer/curveRenderer";
import { ImageRenderer } from "../render/canvas2d/basicRenderer/ImageRenderer";
import { ShapeRenderer } from "../render/canvas2d/basicRenderer/shapeRenderer";
import { SvgRenderer } from "../render/canvas2d/basicRenderer/svgRenderer";
import { TextRenderer } from "../render/canvas2d/basicRenderer/textRenderer";
import { DrawingControllerRenderer } from "../render/canvas2d/controllerRenderer/drawingRenderer";
import { CollisionBoxRenderer } from "../render/canvas2d/entityRenderer/CollisionBoxRenderer";
import { StraightEdgeRenderer } from "../render/canvas2d/entityRenderer/edge/concrete/StraightEdgeRenderer";
import { SymmetryCurveEdgeRenderer } from "../render/canvas2d/entityRenderer/edge/concrete/SymmetryCurveEdgeRenderer";
import { VerticalPolyEdgeRenderer } from "../render/canvas2d/entityRenderer/edge/concrete/VerticalPolyEdgeRenderer";
import { EdgeRenderer } from "../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { EntityDetailsButtonRenderer } from "../render/canvas2d/entityRenderer/EntityDetailsButtonRenderer";
import { EntityRenderer } from "../render/canvas2d/entityRenderer/EntityRenderer";
import { MultiTargetUndirectedEdgeRenderer } from "../render/canvas2d/entityRenderer/multiTargetUndirectedEdge/MultiTargetUndirectedEdgeRenderer";
import { PortalNodeRenderer } from "../render/canvas2d/entityRenderer/portalNode/portalNodeRenderer";
import { SectionRenderer } from "../render/canvas2d/entityRenderer/section/SectionRenderer";
import { SvgNodeRenderer } from "../render/canvas2d/entityRenderer/svgNode/SvgNodeRenderer";
import { TextNodeRenderer } from "../render/canvas2d/entityRenderer/textNode/TextNodeRenderer";
import { UrlNodeRenderer } from "../render/canvas2d/entityRenderer/urlNode/urlNodeRenderer";
import { BackgroundRenderer } from "../render/canvas2d/utilsRenderer/backgroundRenderer";
import { RenderUtils } from "../render/canvas2d/utilsRenderer/RenderUtils";
import { SearchContentHighlightRenderer } from "../render/canvas2d/utilsRenderer/searchContentHighlightRenderer";
import { WorldRenderUtils } from "../render/canvas2d/utilsRenderer/WorldRenderUtils";
import { InputElement } from "../render/domElement/inputElement";
import { Camera } from "../stage/Camera";
import { Canvas } from "../stage/Canvas";
import { LayoutManualAlign } from "../stage/stageManager/concreteMethods/layoutManager/layoutManualAlignManager";
import { AutoAlign } from "../stage/stageManager/concreteMethods/StageAutoAlignManager";
import { DeleteManager } from "../stage/stageManager/concreteMethods/StageDeleteManager";
import { EntityMoveManager } from "../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageUtils } from "../stage/stageManager/concreteMethods/StageManagerUtils";
import { MultiTargetEdgeMove } from "../stage/stageManager/concreteMethods/StageMultiTargetEdgeMove";
import { NodeAdder } from "../stage/stageManager/concreteMethods/StageNodeAdder";
import { NodeConnector } from "../stage/stageManager/concreteMethods/StageNodeConnector";
import { StageNodeRotate } from "../stage/stageManager/concreteMethods/stageNodeRotate";
import { StageObjectColorManager } from "../stage/stageManager/concreteMethods/StageObjectColorManager";
import { StageObjectSelectCounter } from "../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { SectionInOutManager } from "../stage/stageManager/concreteMethods/StageSectionInOutManager";
import { SectionPackManager } from "../stage/stageManager/concreteMethods/StageSectionPackManager";
import { SerializedDataAdder } from "../stage/stageManager/concreteMethods/StageSerializedAdder";
import { TagManager } from "../stage/stageManager/concreteMethods/StageTagManager";
import { StageManager } from "../stage/stageManager/StageManager";
import { AutoLayoutFastTree } from "./controlService/autoLayoutEngine/autoLayoutFastTreeMode";
import { AutoLayout } from "./controlService/autoLayoutEngine/mainTick";
import { ControllerUtils } from "./controlService/controller/concrete/utilsControl";
import { Controller } from "./controlService/controller/Controller";
import { KeyboardOnlyEngine } from "./controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { KeyboardOnlyGraphEngine } from "./controlService/keyboardOnlyEngine/keyboardOnlyGraphEngine";
import { KeyboardOnlyTreeEngine } from "./controlService/keyboardOnlyEngine/keyboardOnlyTreeEngine";
import { SelectChangeEngine } from "./controlService/keyboardOnlyEngine/selectChangeEngine";
import { RectangleSelect } from "./controlService/rectangleSelectEngine/rectangleSelectEngine";
import { SecretKeys } from "./controlService/secretKeysEngine/secretKeysEngine";
import { KeyBinds } from "./controlService/shortcutKeysEngine/KeyBinds";
import { KeyBindsRegistrar } from "./controlService/shortcutKeysEngine/shortcutKeysRegister";
import { MouseInteraction } from "./controlService/stageMouseInteractionCore/stageMouseInteractionCore";
import { AutoComputeUtils } from "./dataGenerateService/autoComputeEngine/AutoComputeUtils";
import { AutoCompute } from "./dataGenerateService/autoComputeEngine/mainTick";
import { GenerateFromFolder } from "./dataGenerateService/generateFromFolderEngine/GenerateFromFolderEngine";
import { StageExport } from "./dataGenerateService/stageExportEngine/stageExportEngine";
import { StageExportPng } from "./dataGenerateService/stageExportEngine/StageExportPng";
import { StageExportSvg } from "./dataGenerateService/stageExportEngine/StageExportSvg";
import { AI } from "./dataManageService/aiEngine/AIEngine";
import { ComplexityDetector } from "./dataManageService/ComplexityDetector";
import { ContentSearch } from "./dataManageService/contentSearchEngine/contentSearchEngine";
import { CopyEngine } from "./dataManageService/copyEngine/copyEngine";
import { Effects } from "./feedbackService/effectEngine/effectMachine";

export namespace GlobalMenu {
  export class Menu {
    constructor(
      public name: string,
      public icon: ReactNode = <></>,
      public items: (MenuItem | Separator)[],
    ) {}
  }
  export class MenuItem {
    constructor(
      public name: string,
      public icon: ReactNode = <></>,
      public fn: () => void = () => {},
    ) {}
  }
  export class Separator {}

  export const menus = [
    new Menu("文件", <File />, [
      new MenuItem("新建", <FilePlus />, () => {
        const project = Project.newDraft();
        project.registerService(Canvas);
        project.registerService(InputElement);
        project.registerService(KeyBinds);
        project.registerService(ControllerUtils);
        project.registerService(AutoComputeUtils);
        project.registerService(RenderUtils);
        project.registerService(WorldRenderUtils);
        project.registerService(StageManager);
        project.registerService(Camera);
        project.registerService(Effects);
        project.registerService(AutoCompute);
        project.registerService(SecretKeys);
        project.registerService(RectangleSelect);
        project.registerService(StageNodeRotate);
        project.registerService(ComplexityDetector);
        project.registerService(AI);
        project.registerService(CopyEngine);
        project.registerService(AutoLayout);
        project.registerService(AutoLayoutFastTree);
        project.registerService(LayoutManualAlign);
        project.registerService(AutoAlign);
        project.registerService(MouseInteraction);
        project.registerService(ContentSearch);
        project.registerService(DeleteManager);
        project.registerService(NodeAdder);
        project.registerService(EntityMoveManager);
        project.registerService(StageUtils);
        project.registerService(MultiTargetEdgeMove);
        project.registerService(NodeConnector);
        project.registerService(StageObjectColorManager);
        project.registerService(StageObjectSelectCounter);
        project.registerService(SectionInOutManager);
        project.registerService(SectionPackManager);
        project.registerService(TagManager);
        project.registerService(KeyboardOnlyEngine);
        project.registerService(KeyboardOnlyGraphEngine);
        project.registerService(KeyboardOnlyTreeEngine);
        project.registerService(SelectChangeEngine);
        project.registerService(TextRenderer);
        project.registerService(ImageRenderer);
        project.registerService(ShapeRenderer);
        project.registerService(EntityRenderer);
        project.registerService(EdgeRenderer);
        project.registerService(MultiTargetUndirectedEdgeRenderer);
        project.registerService(CurveRenderer);
        project.registerService(SvgRenderer);
        project.registerService(DrawingControllerRenderer);
        project.registerService(CollisionBoxRenderer);
        project.registerService(EntityDetailsButtonRenderer);
        project.registerService(StraightEdgeRenderer);
        project.registerService(SymmetryCurveEdgeRenderer);
        project.registerService(VerticalPolyEdgeRenderer);
        project.registerService(PortalNodeRenderer);
        project.registerService(SectionRenderer);
        project.registerService(SvgNodeRenderer);
        project.registerService(TextNodeRenderer);
        project.registerService(UrlNodeRenderer);
        project.registerService(BackgroundRenderer);
        project.registerService(SearchContentHighlightRenderer);
        project.registerService(Renderer);
        project.registerService(Controller);
        project.registerService(StageExport);
        project.registerService(StageExportPng);
        project.registerService(StageExportSvg);
        project.registerService(GenerateFromFolder);
        project.registerService(SerializedDataAdder);
        project.registerService(KeyBindsRegistrar);
        store.set(projectsAtom, [...store.get(projectsAtom), project]);
      }),
      new MenuItem("打开", <FolderOpen />),
      new Separator(),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
    ]),
    new Menu("编辑", <File />, [
      new MenuItem("新建", <FilePlus />),
      new MenuItem("打开", <FolderOpen />),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
    ]),
  ];
}
