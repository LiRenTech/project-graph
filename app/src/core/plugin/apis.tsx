import { v4 } from "uuid";
import { Dialog } from "../../components/dialog";
import { Vector } from "../dataStruct/Vector";
import { Controller } from "../service/controlService/controller/Controller";
import { TextRiseEffect } from "../service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { Camera } from "../stage/Camera";
import { Stage } from "../stage/Stage";
import { StageManager } from "../stage/stageManager/StageManager";
import { TextNode } from "../stage/stageObject/entity/TextNode";
import { PluginAPIMayAsync } from "./types";
import { StageDumper } from "../stage/StageDumper";
import { ConnectableEntity } from "../stage/stageObject/abstract/ConnectableEntity";

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
  // 应该有一个获取当前软件版本号的api
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
  addDebugText(text: string) {
    Stage.effectMachine.addEffect(TextRiseEffect.default(text));
  },
  getCurrentStageJson() {
    return JSON.stringify(StageDumper.dump(), null, 2);
  },
  getCurrentStageSelectedObjectsUUIDs() {
    return StageManager.getSelectedStageObjects().map((stageObject) => stageObject.uuid);
  },
  createTextOnLocation(x: number, y: number, text: string) {
    const newUUID = v4();
    StageManager.addTextNode(
      new TextNode({
        uuid: newUUID,
        details: "",
        location: [x, y],
        size: [100, 100],
        color: [0, 0, 0, 0],
        text,
      }),
    );
    return newUUID;
  },
  connectEntityByTwoUUID(fromUUID: string, toUUID: string): boolean {
    const fromNode = StageManager.getStageObjectByUUID(fromUUID);
    const toNode = StageManager.getStageObjectByUUID(toUUID);
    if (fromNode && toNode && fromNode instanceof ConnectableEntity && toNode instanceof ConnectableEntity) {
      return StageManager.connectEntity(fromNode, toNode);
    }
    return false;
  },
};
