import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Project Graph",
  description:
    "快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "下载", link: "/installation" },
      { text: "捐赠", link: "/donate" },
    ],
    logo: "/logo.svg",
    sidebar: [
      {
        text: "安装",
        link: "/installation",
      },
      {
        text: "快速上手",
        link: "/getting-started",
      },
      {
        text: "特性",
        base: "/features",
        collapsed: false,
        items: [
          {
            text: "👀 视野",
            link: "/camera",
          },
          {
            text: "📦 节点",
            link: "/node",
          },
          {
            text: "↗️ 边",
            link: "/edge",
          },
          {
            text: "📷 图片",
            link: "/image",
          },
          {
            text: "🌲 节点树",
            link: "/tree",
          },
          {
            text: "⛰️ 质点",
            link: "/connect-point",
          },
          {
            text: "□ 框",
            link: "/section",
          },
          {
            text: "📄 导出",
            link: "/export",
          },
          {
            text: "🔗 链接节点",
            link: "/link-node",
          },
          {
            text: "🌐 URL 节点",
            link: "/url-node",
          },
          {
            text: "⚡ 快速操作",
            link: "/quick-action",
          },
          {
            text: "🧩 文件拆分和合并",
            link: "/split-merge",
          },
          {
            text: "🧮 自动计算引擎",
            link: "/compute-engine",
          },
          {
            text: "🧠 AI",
            link: "/ai",
          },
          {
            text: "⌨️ CLI",
            link: "/cli",
          },
        ],
      },
      {
        text: "贡献者",
        link: "/contributors",
      },
      {
        text: "开发指南",
        link: "/contributing",
      },
      {
        text: "常见问题",
        link: "/faq",
      },
      {
        text: "用户协议",
        link: "/terms",
      },
      {
        text: "隐私政策",
        link: "/privacy-policy",
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/LiRenTech/project-graph" },
    ],
    search: {
      provider: "local",
    },
    footer: {
      copyright: "Copyright © 2025 理刃科技",
    },
    editLink: {
      text: "编辑页面",
      pattern:
        "https://github.com/LiRenTech/project-graph/edit/master/docs/:path",
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
    docFooter: {
      prev: "←",
      next: "→",
    },
  },
  sitemap: {
    hostname: "https://project-graph.top",
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
    codeCopyButtonTitle: "复制",
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
  lang: "zh-CN",
  vite: {
    optimizeDeps: {
      exclude: [
        "@nolebase/vitepress-plugin-enhanced-readabilities/client",
        "vitepress",
        "@nolebase/ui",
      ],
    },
    ssr: {
      noExternal: ["@nolebase/*"],
    },
  },
});
