// .vitepress/theme/index.ts
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from "@nolebase/vitepress-plugin-enhanced-readabilities/client";
import "@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css";
import { NolebaseHighlightTargetedHeading } from "@nolebase/vitepress-plugin-highlight-targeted-heading/client";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import "./custom.scss";
import GithubRelease from "./GithubRelease.vue";
import Loading from "./Loading.vue";
import Frame from "./Frame.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.component("GithubRelease", GithubRelease);
    app.component("Loading", Loading);
    app.component("Frame", Frame);
  },
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 为较宽的屏幕的导航栏添加阅读增强菜单
      "nav-bar-content-after": () => h(NolebaseEnhancedReadabilitiesMenu),
      // 为较窄的屏幕（通常是小于 iPad Mini）添加阅读增强菜单
      "nav-screen-content-after": () => h(NolebaseEnhancedReadabilitiesScreenMenu),
      "layout-top": () => [h(NolebaseHighlightTargetedHeading)],
    });
  },
} satisfies Theme;
