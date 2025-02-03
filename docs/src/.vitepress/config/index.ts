import { defineConfig } from "vitepress";
import { sidebarEn } from "./sidebar/en";
import { sidebarZh } from "./sidebar/zh";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Project Graph",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    socialLinks: [
      { icon: "github", link: "https://github.com/LiRenTech/project-graph" },
      {
        icon: "qq",
        link: "https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/",
      },
      {
        icon: "telegram",
        link: "https://t.me/projectgraph",
      },
    ],
    search: {
      provider: "local",
    },
    docFooter: {
      prev: "←",
      next: "→",
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} LiRenTech`,
    },
  },
  sitemap: {
    hostname: "https://project-graph.top",
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
    linkify: true,
  },
  lastUpdated: true,
  cleanUrls: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  ],
  vite: {
    optimizeDeps: {
      exclude: ["@nolebase/vitepress-plugin-enhanced-readabilities/client", "vitepress", "@nolebase/ui"],
    },
    ssr: {
      noExternal: ["@nolebase/*"],
    },
  },
  locales: {
    root: {
      label: "English",
      description: "Draw fast, think efficiently.",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Download", link: "/installation" },
        ],
        sidebar: sidebarEn,
      },
    },
    zh: {
      label: "简体中文",
      description: "快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh/" },
          { text: "下载", link: "/zh/installation" },
          { text: "捐赠", link: "/zh/donate" },
        ],
        sidebar: sidebarZh,
        editLink: {
          text: "编辑页面",
          pattern: "https://github.com/LiRenTech/project-graph/edit/master/docs/:path",
        },
        lastUpdated: {
          text: "上次更新",
        },
        outline: {
          label: "目录",
        },
        notFound: {
          title: "页面未找到",
          quote: "若不改航向，持续寻觅，终将抵达彼岸。",
          linkText: "返回主页",
        },
        sidebarMenuLabel: "导航",
        darkModeSwitchLabel: "主题",
      },
    },
  },
});
