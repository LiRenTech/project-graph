import { Direction } from "../../../../../types/directions";
import { isDesktop } from "../../../../../utils/platform";
import { colorInvert } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { InputElement } from "../../../../render/domElement/inputElement";
import { Camera } from "../../../../stage/Camera";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageNodeAdder } from "../../../../stage/stageManager/concreteMethods/stageNodeAdder";
import { StageHistoryManager } from "../../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { StageObject } from "../../../../stage/stageObject/abstract/StageObject";
import { LineEdge } from "../../../../stage/stageObject/association/LineEdge";
import { PortalNode } from "../../../../stage/stageObject/entity/PortalNode";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../../stage/stageObject/entity/UrlNode";
import { EntityCreateFlashEffect } from "../../../feedbackService/effectEngine/concrete/EntityCreateFlashEffect";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { StageStyleManager } from "../../../feedbackService/stageStyle/StageStyleManager";
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

  // 编辑节点
  clickedNode.isEditing = true;
  InputElement.textarea(
    Renderer.transformWorld2View(clickedNode.rectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedNode.text,
    (text) => {
      clickedNode?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: (clickedNode.color.a === 1
        ? colorInvert(clickedNode.color)
        : colorInvert(StageStyleManager.currentStyle.Background)
      ).toHexStringWithoutAlpha(),
      outline: "solid 1px rgba(255,255,255,0.1)",
      // marginTop: -8 * Camera.currentScale + "px",
    },
    selectAll,
  ).then(() => {
    clickedNode!.isEditing = false;
    Controller.isCameraLocked = false;
    StageHistoryManager.recordStep();
  });
}

export function editEdgeText(clickedLineEdge: LineEdge, selectAll = true) {
  Controller.isCameraLocked = true;

  // clickedLineEdge.isEditing = true;
  InputElement.textarea(
    Renderer.transformWorld2View(clickedLineEdge.textRectangle.location).add(
      Vector.same(Renderer.NODE_PADDING).multiply(Camera.currentScale),
    ),
    clickedLineEdge.text,
    (text) => {
      clickedLineEdge?.rename(text);
    },
    {
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: StageStyleManager.currentStyle.Background.toString(),
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "solid 1px rgba(255,255,255,0.1)",
      // marginTop: -8 * Camera.currentScale + "px",
    },
    selectAll,
  ).then(() => {
    // clickedLineEdge!.isEditing = false;
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
      fontSize: Renderer.FONT_SIZE * Camera.currentScale + "px",
      backgroundColor: "transparent",
      color: StageStyleManager.currentStyle.StageObjectBorder.toString(),
      outline: "none",
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
