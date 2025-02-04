import { StageManager } from "../../stage/stageManager/StageManager";
import tipsJson from "../../../assets/projectGraphTips.json";
import { Camera } from "../../stage/Camera";
import { Vector } from "../../dataStruct/Vector";

/**
 * 专门为了帮助用户理解使用操作而服务的内容
 */
export namespace HelpService {
  export function loadHelp() {
    // 必须反序列化一下，否则会IDE报错
    StageManager.addSerializedData(JSON.parse(JSON.stringify(tipsJson)));
    Camera.location = new Vector(100, -2100);
    Camera.targetScale = 1;
    Camera.currentScale = 1;
  }
}
