import tipsJson from "../../../assets/projectGraphTips.json";
import { Serialized } from "../../../types/node";
import { Vector } from "../../dataStruct/Vector";
import { Camera } from "../../stage/Camera";
// import { getRectangleFromSerializedEntities } from "../dataManageService/copyEngine/copyEngine";
import { Dialog } from "../../../components/dialog";

/**
 * 专门为了帮助用户理解使用操作而服务的内容
 */
export namespace HelpService {
  /**
   * 在当前场景中加载帮助信息
   * 如果当前场景是空的，则直接加载。
   * 如果当前场景不是空的，则判断一下当前舞台的外接矩形，加载到外接矩形的左侧
   */
  export function loadHelp() {
    const diffLocation = new Vector(0, 0);
    // 必须反序列化一下，否则会IDE报错
    const tipsJsonObject: Serialized.File = JSON.parse(JSON.stringify(tipsJson));
    if (!this.project.stageManager.isEmpty()) {
      Dialog.show({
        title: "请新建草稿",
        content: "当前舞台不为空，请新建草稿，或清空舞台内容后再加载引导文件\n\n注：以后会更新多标签页来解决这个问题",
        type: "warning",
      });
      return;
      // // 计算当前舞台的外接矩形
      // const stageRectangle = this.project.stageManager.getBoundingRectangle();

      // const tipsRectangle = getRectangleFromSerializedEntities(tipsJsonObject.entities);
      // // 让tips矩形的右上角，顶住，stageRectangle的左上角
      // diffLocation = stageRectangle.leftCenter.subtract(tipsRectangle.rightTop);
    }

    this.project.stageManager.addSerializedData(tipsJsonObject, diffLocation);

    Camera.location = new Vector(100, -2100).add(diffLocation);
    Camera.targetScale = 1;
    Camera.currentScale = 1;
  }
}
