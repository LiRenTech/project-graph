import { TextNode } from "../../../stageObject/entity/TextNode";
import { Camera } from "../../Camera";
import { StageManager } from "../StageManager";

export namespace StageTagManager {
  /**
   * 将所有选择的实体添加或移除标签
   *
   * 目前先仅支持TextNode
   */
  export function changeTagBySelected() {
    for (const selectedEntities of StageManager.getSelectedEntities().filter(
      (entity) => entity instanceof TextNode,
    )) {
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
  export function getTagNames() {
    const res: {tagName: string, uuid: string}[] = [];
    for (const tagUUID of StageManager.TagOptions.getTagUUIDs()) {
      const tagObject = StageManager.getEntitiesByUUIDs([tagUUID])[0];
      if (tagObject instanceof TextNode) {
        res.push({tagName: tagObject.text, uuid: tagUUID});
      } else {
        res.push({tagName: tagUUID, uuid: tagUUID});
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
