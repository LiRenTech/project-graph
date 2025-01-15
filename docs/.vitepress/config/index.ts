import { defineConfig } from "vitepress";

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
  locales: {
    zh: {
      label: "简体中文",
      description:
        "快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "首页", link: "/zh/" },
          { text: "下载", link: "/zh/installation" },
          { text: "捐赠", link: "/zh/donate" },
        ],
        sidebar: [
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
            link: "/zh/contributors",
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
            link: "/zh/privacy-policy",
          },
        ],
        editLink: {
          text: "编辑页面",
          pattern:
            "https://github.com/LiRenTech/project-graph/edit/master/docs/zh/:path",
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
          { text: "Home", link: "/en/" },
          { text: "Download", link: "/en/installation" },
        ],
        sidebar: [
          {
            text: "Installation",
            link: "/en/installation",
          },
          {
            text: "Contributing Guide",
            link: "/en/contributing",
          },
          {
            text: "Frequently Asked Questions",
            link: "/en/faq",
          },
        ],
      },
    },
  },
});
