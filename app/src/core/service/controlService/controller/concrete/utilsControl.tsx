import AutoCompleteWindow from "../../../../../pages/_sub_window/AutoCompleteWindow";
import { Direction } from "../../../../../types/directions";
import { isDesktop } from "../../../../../utils/platform";
import { colorInvert } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { InputElement } from "../../../../render/domElement/inputElement";
import { Camera } from "../../../../stage/Camera";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageNodeAdder } from "../../../../stage/stageManager/concreteMethods/StageNodeAdder";
import { StageObjectSelectCounter } from "../../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageHistoryManager } from "../../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { StageObject } from "../../../../stage/stageObject/abstract/StageObject";
import { Edge } from "../../../../stage/stageObject/association/Edge";
import { LineEdge } from "../../../../stage/stageObject/association/LineEdge";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../../stage/stageObject/entity/UrlNode";
import { LogicNodeNameToRenderNameMap } from "../../../dataGenerateService/autoComputeEngine/logicNodeNameEnum";
import { EntityCreateFlashEffect } from "../../../feedbackService/effectEngine/concrete/EntityCreateFlashEffect";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";
import { SubWindow } from "../../../SubWindow";
import { Controller } from "../Controller";

/**
 * 这里是专门存放代码相同的地方
 *    因为有可能多个控制器公用同一个代码，
 */

/**
 * 编辑节点
 * @param clickedNode
 */
export function editTextNode(clickedNode: TextNode, selectAll = true) {
  Controller.isCameraLocked = true;
  const rectWorld = clickedNode.collisionBox.getRectangle();
  const rectView = rectWorld.transformWorld2View();
  const fontColor = (
    clickedNode.color.a === 1 ? colorInvert(clickedNode.color) : colorInvert(StageStyleManager.currentStyle.Background)
  ).toHexStringWithoutAlpha();
  // 编辑节点
  clickedNode.isEditing = true;
  // RectangleElement.div(rectView, StageStyleManager.currentStyle.CollideBoxSelected);
  let lastAutoCompleteWindowId: string;
  InputElement.textarea(
    clickedNode.text,
    // "",
    (text, ele) => {
      if (lastAutoCompleteWindowId) {
        SubWindow.close(lastAutoCompleteWindowId);
      }
      // 自动补全逻辑节点
      if (text.startsWith("#")) {
        lastAutoCompleteWindowId = AutoCompleteWindow.open(
          clickedNode.rectangle.transformWorld2View().leftBottom,
          Object.fromEntries(
            Object.entries(LogicNodeNameToRenderNameMap).filter(([k]) =>
              k.toLowerCase().startsWith(text.toLowerCase()),
            ),
          ),
          (value) => {
            ele.value = value;
          },
        ).id;
      }
      // onChange
      clickedNode?.rename(text);
      const rectWorld = clickedNode.collisionBox.getRectangle();
      const rectView = rectWorld.transformWorld2View();
      ele.style.height = "auto";
      ele.style.height = `${rectView.height.toFixed(2)}px`;
      // 自动改变宽度
      ele.style.width = "auto";
      ele.style.width = `${rectView.width.toFixed(2)}px`;
      // 自动调整它的外层框的大小
      const fatherSections = SectionMethods.getFatherSectionsList(clickedNode);
      for (const section of fatherSections) {
        section.adjustLocationAndSize();
      }
    },
    {
      position: "fixed",
      resize: "none",
      boxSizing: "border-box",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      left: `${rectView.left.toFixed(2)}px`,
      top: `${rectView.top.toFixed(2)}px`,
      // ====
      // width: `${rectView.width.toFixed(2)}px`,
      // maxWidth: `${rectView.width.toFixed(2)}px`,
      minWidth: `${rectView.width.toFixed(2)}px`,
      minHeight: `${rectView.height.toFixed(2)}px`,
      // height: `${rectView.height.toFixed(2)}px`,
      padding: Renderer.NODE_PADDING * Camera.currentScale + "px",
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: fontColor,
      outline: `solid ${2 * Camera.currentScale}px ${StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(0.25).toString()}`,
      borderRadius: `${Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale}px`,
    },
    selectAll,
    rectWorld.width * Camera.currentScale, // limit width
  ).then(() => {
    SubWindow.close(lastAutoCompleteWindowId);
    clickedNode!.isEditing = false;
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
    // 更新选中内容的数量
    StageObjectSelectCounter.update();
  });
}

export function editEdgeText(clickedLineEdge: Edge, selectAll = true) {
  Controller.isCameraLocked = true;

  // clickedLineEdge.isEditing = true;
  const textAreaLocation = Renderer.transformWorld2View(clickedLineEdge.textRectangle.location).add(
    Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
  );
  InputElement.textarea(
    clickedLineEdge.text,
    (text) => {
      clickedLineEdge?.rename(text);
    },
    {
      position: "fixed",
      resize: "none",
      boxSizing: "border-box",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      left: `${textAreaLocation.x.toFixed(2)}px`,
      top: `${textAreaLocation.y.toFixed(2)}px`,
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: StageStyleManager.currentStyle.Background.toString(),
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "solid 1px rgba(255,255,255,0.1)",
      // marginTop: -8 * Camera.currentScale + "px",
    },
    selectAll,
  ).then(() => {
    // clickedLineEdge!.isEditing = false;
    // 因为这里用的是不透明文本框，所以不需要停止节点上文字的渲染
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}
export function editMultiTargetEdgeText(clickedEdge: MultiTargetUndirectedEdge, selectAll = true) {
  Controller.isCameraLocked = true;

  // clickedLineEdge.isEditing = true;
  const textAreaLocation = Renderer.transformWorld2View(clickedEdge.textRectangle.location).add(
    Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
  );
  InputElement.textarea(
    clickedEdge.text,
    (text) => {
      clickedEdge?.rename(text);
    },
    {
      position: "fixed",
      resize: "none",
      boxSizing: "border-box",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      left: `${textAreaLocation.x.toFixed(2)}px`,
      top: `${textAreaLocation.y.toFixed(2)}px`,
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: StageStyleManager.currentStyle.Background.toString(),
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "solid 1px rgba(255,255,255,0.1)",
      // marginTop: -8 * Camera.currentScale + "px",
    },
    selectAll,
  ).then(() => {
    // clickedLineEdge!.isEditing = false;
    // 因为这里用的是不透明文本框，所以不需要停止节点上文字的渲染
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}

export function editUrlNodeTitle(clickedUrlNode: UrlNode) {
  Controller.isCameraLocked = true;
  // 编辑节点
  clickedUrlNode.isEditingTitle = true;
  InputElement.input(
    Renderer.transformWorld2View(clickedUrlNode.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedUrlNode.title,
    (text) => {
      clickedUrlNode?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "none",
      marginTop: -8 * Camera.currentScale + "px",
      width: "100vw",
    },
  ).then(() => {
    clickedUrlNode!.isEditingTitle = false;
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}

export function editSectionTitle(section: Section) {
  Controller.isCameraLocked = true;
  // 编辑节点
  section.isEditingTitle = true;
  InputElement.input(
    Renderer.transformWorld2View(section.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    section.text,
    (text) => {
      section.rename(text);
    },
    {
      position: "fixed",
      resize: "none",
      boxSizing: "border-box",
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: `solid ${2 * Camera.currentScale}px ${StageStyleManager.currentStyle.effects.successShadow.toNewAlpha(0.25).toString()}`,
      marginTop: -8 * Camera.currentScale + "px",
    },
  ).then(() => {
    section.isEditingTitle = false;
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}

export function editPortalNodeTitle(clickedPortalNode: PortalNode) {
  Controller.isCameraLocked = true;
  // 编辑节点
  clickedPortalNode.isEditingTitle = true;
  InputElement.input(
    Renderer.transformWorld2View(clickedPortalNode.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedPortalNode.title,
    (text) => {
      clickedPortalNode?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "none",
      marginTop: -8 * Camera.currentScale + "px",
      width: "100vw",
    },
  ).then(() => {
    clickedPortalNode!.isEditingTitle = false;
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}

/**
 * 一个全局对象，用于编辑节点的钩子函数
 */
export const editTextNodeHookGlobal = {
  /**
   * 编辑节点的钩子函数，用于开始编辑，弹窗触发
   * @param _
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionStart(_: Entity) {
    // 在外部将被修改
  },
  /**
   * 编辑节点的钩子函数，用于结束编辑，弹窗关闭
   * @param _
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hookFunctionEnd(_: Entity) {
    // 在外部将被修改
  },
};

/**
 * 通过快捷键的方式来打开Entity的详细信息编辑
 */
export function editNodeDetailsByKeyboard() {
  const nodes = StageManager.getEntities().filter((node) => node.isSelected);
  if (nodes.length === 0) {
    Stage.effectMachine.addEffect(TextRiseEffect.default("请先选择一个节点，才能编辑详细信息"));
    return;
  }
  editNodeDetails(nodes[0]);
}

export function editNodeDetails(clickedNode: Entity) {
  // Controller.isCameraLocked = true;
  // 编辑节点详细信息的视野移动锁定解除，——用户：快深频

  clickedNode.isEditingDetails = true;
  editTextNodeHookGlobal.hookFunctionStart(clickedNode);
}

export function addTextNodeByLocation(
  location: Vector,
  selectCurrent: boolean = false,
  successCallback?: (uuid: string) => void,
) {
  const sections = SectionMethods.getSectionsByInnerLocation(location);
  // 新建节点
  StageNodeAdder.addTextNodeByClick(location, sections, selectCurrent).then((uuid) => {
    textNodeInEditModeByUUID(uuid);
    if (successCallback) {
      successCallback(uuid);
    }
  });
}

export function addTextNodeFromCurrentSelectedNode(direction: Direction, selectCurrent = false) {
  StageNodeAdder.addTextNodeFromCurrentSelectedNode(direction, [], selectCurrent).then((uuid) => {
    textNodeInEditModeByUUID(uuid);
  });
}

function textNodeInEditModeByUUID(uuid: string) {
  const createNode = StageManager.getTextNodeByUUID(uuid);
  if (createNode === null) {
    // 说明 创建了立刻删掉了
    return;
  }
  // 整特效
  Stage.effectMachine.addEffect(EntityCreateFlashEffect.fromCreateEntity(createNode));
  if (isDesktop) {
    editTextNode(createNode);
  }
}

/**
 * 检测鼠标是否点击到了某个stage对象上
 * @param clickedLocation
 */
export function getClickedStageObject(clickedLocation: Vector) {
  let clickedStageObject: StageObject | null = StageManager.findEntityByLocation(clickedLocation);
  // 补充：在宏观视野下，框应该被很轻松的点击
  if (clickedStageObject === null && Camera.currentScale < Section.bigTitleCameraScale) {
    const clickedSections = SectionMethods.getSectionsByInnerLocation(clickedLocation);
    if (clickedSections.length > 0) {
      clickedStageObject = clickedSections[0];
    }
  }
  if (clickedStageObject === null) {
    for (const association of StageManager.getAssociations()) {
      if (association instanceof LineEdge) {
        if (association.target.isHiddenBySectionCollapse && association.source.isHiddenBySectionCollapse) {
          continue;
        }
      }
      if (association.collisionBox.isContainsPoint(clickedLocation)) {
        clickedStageObject = association;
        break;
      }
    }
  }
  return clickedStageObject;
}

/**
 * 鼠标是否点击在了调整大小的小框上
 * @param clickedLocation
 */
export function isClickedResizeRect(clickedLocation: Vector): boolean {
  const selectedEntities = StageManager.getSelectedStageObjects();

  for (const selectedEntity of selectedEntities) {
    if (selectedEntity instanceof TextNode) {
      const resizeRect = selectedEntity.getResizeHandleRect();
      if (resizeRect.isPointIn(clickedLocation)) {
        // 点中了扩大缩小的东西
        console.log("点击在了调整大小的小框上");
        return true;
      }
    }
  }
  return false;
}
