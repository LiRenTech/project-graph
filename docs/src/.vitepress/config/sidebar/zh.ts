import { DefaultTheme } from "vitepress";

const guide: DefaultTheme.SidebarItem[] = [
  {
    text: "介绍",
    link: "/zh/guide/",
  },
  {
    text: "安装",
    link: "/zh/guide/installation",
  },
  {
    text: "快速上手",
    link: "/zh/guide/getting-started",
  },
  {
    text: "特性",
    base: "/zh/guide/features",
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
        text: "↗️ 连线",
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
        text: "📄 导入",
        link: "/import",
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
        text: "🚪 传送门节点",
        link: "/portal-node",
      },
      {
        text: "✏ 涂鸦",
        link: "/pen-stroke",
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
    text: "常见问题",
    link: "/zh/guide/faq",
  },
  {
    text: "用户协议",
    link: "/zh/misc/terms",
  },
  {
    text: "隐私政策",
    link: "/zh/misc/privacy",
  },
];

const dev: DefaultTheme.SidebarItem[] = [
  {
    text: "开发指南",
    link: "/zh/dev/",
  },
  {
    text: "iframe 框架",
    link: "/zh/dev/iframe",
  },
  {
    text: "@pg/ui",
    link: "https://ui.project-graph.top",
  },
];

export const sidebarZh: DefaultTheme.SidebarMulti = {
  "/zh/guide/": guide,
  "/zh/dev": dev,
};
