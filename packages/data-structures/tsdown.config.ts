import originalClassName from "@graphif/unplugin-original-class-name/rollup";
import { defineConfig } from "tsdown/config";

export default defineConfig({
  plugins: [originalClassName()],
});
