import { Camera } from "../../Camera";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";

export namespace StageTagManager {
  /**
   * 将所有选择的实体添加或移除标签
   *
   * 目前先仅支持TextNode
   */
  export function changeTagBySelected() {
    for (const selectedEntities of StageManager.getSelectedEntities().filter((entity) => entity instanceof TextNode)) {
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
    const tagObjectList: Entity[] = [];
    for (const tagUUID of tagUUIDs) {
      tagObjectList.push(StageManager.getEntitiesByUUIDs([tagUUID])[0]);
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
      if (tagObject instanceof TextNode) {
        res.push({ tagName: tagObject.text, uuid: tagObject.uuid });
      } else if (tagObject instanceof Section) {
        res.push({ tagName: tagObject.text, uuid: tagObject.uuid });
      } else {
        res.push({ tagName: tagObject.uuid, uuid: tagObject.uuid });
      }
    }
    return res;
  }

  export function moveToTag(tagUUID: string) {
    const tagObject = StageManager.getEntitiesByUUIDs([tagUUID])[0];
    if (!tagObject) {
      return;
    }
    const location = tagObject.collisionBox.getRectangle().center;
    Camera.location = location;
  }
}
