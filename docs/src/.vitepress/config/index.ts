import { defineConfig } from "vitepress";
import { sidebarEn } from "./sidebar/en";
import { sidebarZhCn } from "./sidebar/zhCn";

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
        link: "https://qm.qq.com/cgi-bin/qm/qr?k=smSidcY7O_wbU9fqAhgobcOpmTKJrZ1P&jump_from=webapi&authKey=eqX5/gvxrWlfyhu0xiLqA+yLoUPa1X5fZbbuEWdqB+JzBR7TO6/XY1e69QwtQ/sn",
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
    zh_CN: {
      label: "简体中文",
      description: "快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh_CN/" },
          { text: "指南", link: "/zh_CN/guide/" },
          { text: "开发", link: "/zh_CN/dev/" },
          { text: "捐赠", link: "/zh_CN/donate" },
          { text: "在线使用", link: "https://web.project-graph.top" },
        ],
        sidebar: sidebarZhCn,
        editLink: {
          text: "编辑页面",
          pattern: "https://github.com/LiRenTech/project-graph/edit/master/docs/src/:path",
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
    en: {
      label: "English",
      description: "Draw fast, think efficiently.",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Download", link: "/installation" },
        ],
        sidebar: sidebarEn,
        editLink: {
          pattern: "https://github.com/LiRenTech/project-graph/edit/master/docs/src/:path",
        },
      },
    },
  },
});
