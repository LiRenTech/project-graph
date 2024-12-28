import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Project Graph",
  description:
    "快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "首页", link: "/" }],
    logo: "/logo.svg",
    sidebar: [
      {
        text: "Project Graph",
        link: "/",
      },
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
        ],
      },
      {
        text: "贡献者",
        link: "/contributors",
      },
      {
        text: "为什么重写",
        link: "/why-rewriting",
      },
      {
        text: "开发指南",
        link: "/contributing",
      },
      {
        text: "JSON 文档格式",
        link: "/json-format",
      },
      {
        text: "常见问题",
        link: "/faq",
      },
      {
        text: "用户协议",
        link: "/terms",
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/LiRenTech/project-graph" },
    ],
    search: {
      provider: "local",
    },
    footer: {
      copyright: "Copyright © 2024 理刃科技",
    },
    editLink: {
      text: "编辑页面",
      pattern: "https://github.com/LiRenTech/docs/edit/master/:path",
    },
    lastUpdated: {
      text: "上次更新",
    },
    outline: {
      label: "目录",
    },
  },
  sitemap: {
    hostname: "https://project-graph.top",
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
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
});
