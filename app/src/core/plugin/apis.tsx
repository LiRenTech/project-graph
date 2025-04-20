import { Dialog } from "../../components/dialog";
import { Vector } from "../dataStruct/Vector";
import { Controller } from "../service/controlService/controller/Controller";
import { Camera } from "../stage/Camera";
import { PluginAPI } from "./types";

export const pluginApis: PluginAPI = {
  hello() {
    return "Hello from Project Graph";
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
