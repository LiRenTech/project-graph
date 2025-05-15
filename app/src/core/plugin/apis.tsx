import { v4 } from "uuid";
import { Dialog } from "../../components/dialog";
import { Vector } from "../dataStruct/Vector";
import { Controller } from "../service/controlService/controller/Controller";
import { Camera } from "../stage/Camera";
import { StageManager } from "../stage/stageManager/StageManager";
import { PluginAPIMayAsync } from "./types";
import { TextNode } from "../stage/stageObject/entity/TextNode";
import { Stage } from "../stage/Stage";

export const pluginApis: PluginAPIMayAsync = {
  hello(userString: string) {
    console.log("用户插件调用hello", userString);
    Dialog.show({
      title: "插件调用成功",
      content: `你好，${userString}`,
      type: "success",
    });
    return "hello";
  },
  getCameraLocation() {
    return Camera.location.toArray();
  },
  setCameraLocation(x, y) {
    Camera.location = new Vector(x, y);
  },
  getPressingKey() {
    return [...Controller.pressingKeySet];
  },
  getPressingKeySequence(): string[] {
    return Stage.secretKeyEngine.getCurrentPressedKeys();
  },
  clearPressingKey() {
    Controller.pressingKeySet.clear();
  },
  clearPressingKeySequence() {
    Stage.secretKeyEngine.clearSequenceForced();
  },
  openDialog(title, content) {
    Dialog.show({
      title,
      content,
    });
  },
  getCurrentStageJson() {
    return StageManager.getStageJsonByPlugin();
  },
  getCurrentStageSelectedObjectsUUIDs() {
    return StageManager.getSelectedStageObjects().map((stageObject) => stageObject.uuid);
  },
  createTextOnLocation(x: number, y: number, text: string) {
    StageManager.addTextNode(
      new TextNode({
        uuid: v4(),
        details: "",
        location: [x, y],
        size: [100, 100],
        color: [0, 0, 0, 0],
        text,
      }),
    );
  },
};
