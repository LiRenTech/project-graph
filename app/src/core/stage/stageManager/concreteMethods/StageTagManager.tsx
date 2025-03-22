import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Renderer } from "../../../render/canvas2d/renderer";
import { MouseLocation } from "../../../service/controlService/MouseLocation";
import { LineCuttingEffect } from "../../../service/feedbackService/effectEngine/concrete/LineCuttingEffect";
import { RectangleNoteEffect } from "../../../service/feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../Camera";
import { Stage } from "../../Stage";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { StageObject } from "../../stageObject/abstract/StageObject";
import { Edge } from "../../stageObject/association/Edge";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { UrlNode } from "../../stageObject/entity/UrlNode";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { StageManager } from "../StageManager";

export namespace StageTagManager {
  /**
   * 将所有选择的实体添加或移除标签
   *
   * 目前先仅支持TextNode
   */
  export function changeTagBySelected() {
    for (const selectedEntities of StageManager.getSelectedStageObjects()) {
      // 若有则删，若无则加
      if (StageManager.TagOptions.hasTag(selectedEntities.uuid)) {
        StageManager.TagOptions.removeTag(selectedEntities.uuid);
      } else {
        StageManager.TagOptions.addTag(selectedEntities.uuid);
      }
    }
  }

  /**
   * 用于ui渲染
   * @returns 所有标签对应的名字
   */
  export function refreshTagNamesUI() {
    const res: { tagName: string; uuid: string; color: [number, number, number, number] }[] = [];
    const tagUUIDs = StageManager.TagOptions.getTagUUIDs();
    const tagObjectList: StageObject[] = [];
    for (const tagUUID of tagUUIDs) {
      const stageObject = StageManager.getStageObjectByUUID(tagUUID);
      if (stageObject) {
        tagObjectList.push(stageObject);
      }
    }
    // 排序，从上到下，从左到右
    // tagObjectList.sort((a, b) => {
    //   const topDiff = a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top;
    //   if (topDiff === 0) {
    //     return a.collisionBox.getRectangle().left - b.collisionBox.getRectangle().left;
    //   }
    //   return topDiff;
    // });

    for (const tagObject of tagObjectList) {
      let title = "";
      let colorItem: [number, number, number, number] = [0, 0, 0, 0];
      if (tagObject instanceof TextNode) {
        title = tagObject.text;
        colorItem = tagObject.color.toArray();
      } else if (tagObject instanceof Section) {
        title = tagObject.text;
        colorItem = tagObject.color.toArray();
      } else if (tagObject instanceof UrlNode) {
        title = tagObject.title;
      } else if (tagObject instanceof ImageNode) {
        title = "Image: " + tagObject.uuid.slice(0, 4);
      } else if (tagObject instanceof Edge) {
        title = tagObject.text.slice(0, 20).trim();
        if (title.length === 0) {
          title = "未命名连线";
        }
        if (tagObject instanceof LineEdge) {
          colorItem = tagObject.color.toArray();
        }
      } else if (tagObject instanceof ConnectPoint) {
        title = tagObject.details.slice(0, 20).trim();
        if (title.length === 0) {
          title = "Connect Point: " + tagObject.uuid.slice(0, 4);
        }
      } else {
        title = "Unknown: " + tagObject.uuid.slice(0, 4);
      }
      res.push({ tagName: title, uuid: tagObject.uuid, color: colorItem });
    }
    return res;
  }

  /**
   * 跳转到标签位置
   * @param tagUUID
   * @returns
   */
  export function moveCameraToTag(tagUUID: string) {
    const tagObject = StageManager.getStageObjectByUUID(tagUUID);
    if (!tagObject) {
      return;
    }
    if (tagObject instanceof ConnectableEntity) {
      const childNodes = GraphMethods.getSuccessorSet(tagObject);
      const boundingRect = Rectangle.getBoundingRectangle(
        childNodes.map((childNode) => childNode.collisionBox.getRectangle()),
      );
      Camera.resetByRectangle(boundingRect);
      Stage.effectMachine.addEffect(
        new LineCuttingEffect(
          new ProgressNumber(0, 10),
          Renderer.transformView2World(MouseLocation.vector()),
          tagObject.collisionBox.getRectangle().center,
          Color.Green,
          Color.Green,
        ),
      );
      Stage.effectMachine.addEffect(
        new RectangleNoteEffect(
          new ProgressNumber(0, 30),
          boundingRect,
          StageStyleManager.currentStyle.CollideBoxPreSelected,
        ),
      );
    } else {
      const location = tagObject.collisionBox.getRectangle().center;
      Camera.location = location;
      Stage.effectMachine.addEffect(
        new LineCuttingEffect(
          new ProgressNumber(0, 10),
          Renderer.transformView2World(MouseLocation.vector()),
          location,
          Color.Green,
          Color.Green,
        ),
      );
    }
  }
}
