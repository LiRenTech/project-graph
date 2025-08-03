import { PluginAPIMayAsync } from "@/core/plugin/types";
import { toast } from "sonner";

export const pluginApis: PluginAPIMayAsync = {
  hello(userString: string) {
    toast.success(`Hello ${userString}`);
    return "hello";
  },
};
