// .vitepress/theme/index.ts
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import GithubRelease from "./GithubRelease.vue";
import Loading from "./Loading.vue";
import "./custom.scss";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.component("GithubRelease", GithubRelease);
    app.component("Loading", Loading);
  },
} satisfies Theme;
