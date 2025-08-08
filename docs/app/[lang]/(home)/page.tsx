"use client";

import ThemeProvider from "@/app/theme-provider";
import { Hero } from "@primer/react-brand";
import "@primer/react-brand/lib/css/main.css";
import { ChevronRight, PlayCircle } from "lucide-react";
import { useParams } from "next/navigation";

const translations = {
  "zh-CN": {
    news: "2.0 版本将在 8 月 21 日发布",
    slogan: ["笔起思涌", "图见真意"],
    description:
      "一款强大的图形化思维工具，让知识管理变得优雅自然。通过直观的节点连接和智能布局，将你的想法转化为清晰的知识网络。基于现代桌面技术构建，注重性能与隐私，让你的创意畅通无阻。",
    start: "开始使用",
    video: "宣传片",
  },
  en: {
    news: "Version 2.0 will be released on August 21",
    slogan: ["Draw fast", "Think efficiently"],
    description: "Next-generation node graph drawing tool",
    start: "Get started",
    video: "Watch video",
  },
};

export default function Page() {
  const { lang } = useParams() as { lang: string };

  if (!(lang in translations)) {
    return <></>;
  }

  function t<T extends keyof (typeof translations)[keyof typeof translations]>(
    key: T,
  ): (typeof translations)[keyof typeof translations][T] {
    return translations[lang as keyof typeof translations][key];
  }

  return (
    <ThemeProvider>
      <main className="[&_.lucide]:fill-none! container flex min-h-full flex-col items-center gap-8 py-28">
        <Hero>
          <Hero.Label>{t("news")}</Hero.Label>
          <Hero.Heading className="leading-22!">
            {t("slogan").map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </Hero.Heading>
          <Hero.Description className="opacity-75">{t("description")}</Hero.Description>
          <Hero.PrimaryAction variant="accent" href="/docs/app" trailingVisual={<ChevronRight />}>
            {t("start")}
          </Hero.PrimaryAction>
          <Hero.SecondaryAction href="https://www.bilibili.com/BV1W4k7YqEgU" leadingVisual={<PlayCircle />}>
            {t("video")}
          </Hero.SecondaryAction>
        </Hero>
      </main>
    </ThemeProvider>
  );
}
