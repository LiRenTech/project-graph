import { Dialog } from "../../components/dialog";
import { PluginAPIMayAsync } from "./types";

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
};
