import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Renderer } from "../../../render/canvas2d/renderer";
import { MouseLocation } from "../../../service/controlService/MouseLocation";
import { LineCuttingEffect } from "../../../service/feedbackService/effectEngine/concrete/LineCuttingEffect";
import { Camera } from "../../Camera";
import { Stage } from "../../Stage";
import { StageObject } from "../../stageObject/abstract/StageObject";
import { Edge } from "../../stageObject/association/Edge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { UrlNode } from "../../stageObject/entity/UrlNode";
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
  export function refreshTagNames() {
    const res: { tagName: string; uuid: string }[] = [];
    const tagUUIDs = StageManager.TagOptions.getTagUUIDs();
    const tagObjectList: StageObject[] = [];
    for (const tagUUID of tagUUIDs) {
      const stageObject = StageManager.getStageObjectByUUID(tagUUID);
      if (stageObject) {
        tagObjectList.push(stageObject);
      }
    }
    // 排序，从上到下，从左到右
    tagObjectList.sort((a, b) => {
      const topDiff = a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top;
      if (topDiff === 0) {
        return a.collisionBox.getRectangle().left - b.collisionBox.getRectangle().left;
      }
      return topDiff;
    });

    for (const tagObject of tagObjectList) {
      let title = "";
      if (tagObject instanceof TextNode) {
        title = tagObject.text;
      } else if (tagObject instanceof Section) {
        title = tagObject.text;
      } else if (tagObject instanceof UrlNode) {
        title = tagObject.title;
      } else if (tagObject instanceof ImageNode) {
        title = "Image: " + tagObject.uuid.slice(0, 4);
      } else if (tagObject instanceof Edge) {
        title = tagObject.text.slice(0, 20).trim();
        if (title.length === 0) {
          title = "未命名连线";
        }
      } else if (tagObject instanceof ConnectPoint) {
        title = tagObject.details.slice(0, 20).trim();
        if (title.length === 0) {
          title = "Connect Point: " + tagObject.uuid.slice(0, 4);
        }
      } else {
        title = "Unknown: " + tagObject.uuid.slice(0, 4);
      }
      res.push({ tagName: title, uuid: tagObject.uuid });
    }
    return res;
  }

  export function moveCameraToTag(tagUUID: string) {
    const tagObject = StageManager.getStageObjectByUUID(tagUUID);
    if (!tagObject) {
      return;
    }
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
