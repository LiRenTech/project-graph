import { DefaultTheme } from "vitepress";

export const sidebarZh: DefaultTheme.Sidebar = [
  {
    text: "安装",
    link: "/zh/installation",
  },
  {
    text: "快速上手",
    link: "/zh/getting-started",
  },
  {
    text: "特性",
    base: "/zh/features",
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
    text: "开发指南",
    link: "/zh/contributing",
  },
  {
    text: "常见问题",
    link: "/zh/faq",
  },
  {
    text: "用户协议",
    link: "/zh/terms",
  },
  {
    text: "隐私政策",
    link: "/zh/privacy",
  },
];
