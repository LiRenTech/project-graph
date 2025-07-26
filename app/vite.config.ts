/// <reference types="vitest/config" />

import generouted from "@generouted/react-router/plugin";
import originalClassName from "@graphif/unplugin-original-class-name/vite";
import pgTheme from "@graphif/vite-plugin-pg-theme";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import reactScan from "@react-scan/vite-plugin-react-scan";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-oxc";
import { createLogger, defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const host = "0.0.0.0";
export const viteLogger = createLogger("info", { prefix: "[project-graph]" });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    pgTheme({
      glob: "src/themes/*.pg-theme",
      out: "src/css/theme.pcss",
      defaultTheme: "dark",
    }),
    originalClassName({
      staticMethodName: "className",
    }),
    // 将svg文件作为react组件导入
    // import Icon from "./icon.svg?react"
    svgr(),
    // 解析yaml文件，作为js对象导入
    // import config from "./config.yaml"
    ViteYaml(),
    // react插件
    react(),
    // 自动生成路由文件
    generouted(),
    // 分析组件性能
    reactScan({
      enable: process.env.LR_REACT_SCAN === "true",
    }),
  ],

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
      ignored: ["**/src-tauri/**"],
    },
  },

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

  test: {
    environment: "jsdom",
    include: ["./tests/**/*.test.tsx"],
    env: {
      LR_VITEST: "true",
    },
  },
});
