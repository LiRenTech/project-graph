import { Dialog } from "../../components/dialog";
import { Vector } from "../dataStruct/Vector";
import { Controller } from "../service/controlService/controller/Controller";
import { Camera } from "../stage/Camera";
import { PluginAPI } from "./types";

export const pluginApis: PluginAPI = {
  hello(userString: string) {
    console.log("用户插件调用hello", userString);
    Dialog.show({
      title: "插件调用成功",
      content: `你好，${userString}`,
      type: "success",
    });
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
  openDialog(title, content) {
    Dialog.show({
      title,
      content,
    });
  },
};
