import "@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./custom.scss";
import Frame from "./Frame.vue";
import GithubRelease from "./GithubRelease.vue";
import Layout from "./Layout.vue";
import Loading from "./Loading.vue";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    // register your custom global components
    app.component("GithubRelease", GithubRelease);
    app.component("Loading", Loading);
    app.component("Frame", Frame);
  },
} satisfies Theme;
