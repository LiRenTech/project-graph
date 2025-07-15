import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import type {} from "@nuxt/schema";
import unplugin from ".";
import type { Options } from "./types";

export default defineNuxtModule({
  setup(options: Options) {
    addWebpackPlugin(unplugin.webpack(options));
    addVitePlugin(unplugin.vite(options));
  },
});
