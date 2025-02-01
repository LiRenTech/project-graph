import generouted from "@generouted/react-router/plugin";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// @ts-expect-error 这里没有加载@types/node类型，但是这个process实际上是存在的
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    tailwindcss(),
    // 将svg文件作为react组件导入
    // import Icon from "./icon.svg?react"
    svgr(),
    // 解析yaml文件，作为js对象导入
    // import config from "./config.yaml"
    ViteYaml(),
    // 使用swc的react插件
    react({ tsDecorators: true }),
    // 自动生成路由文件
    generouted(),
  ],

  // region Tauri
  // 不清屏，方便看rust报错
  clearScreen: false,
  // tauri需要固定的端口
  server: {
    port: 1420,
    // 端口冲突时直接报错，不尝试下一个可用端口
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 不监控src-tauri目录的更改
      ignored: ["**/src-tauri/**"],
    },
  },
  // endregion

  // 2024年10月3日发现 pnpm build 会报错，
  // Top-level await is not available in the configured target environment
  // 添加下面的配置解决了
  // 2024/10/05 main.tsx去掉了顶层await，所以不需要这个配置
  // build: {
  //   target: "esnext",
  // },

  // 环境变量前缀
  // 只有名字以LR_开头的环境变量才会被注入到前端
  // import.meta.env.LR_xxx
  envPrefix: "LR_",
}));
