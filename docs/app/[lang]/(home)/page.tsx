import DynamicLink from "fumadocs-core/dynamic-link";
import { PlayCircle } from "lucide-react";

const translations = {
  "zh-CN": {
    news: "2.0 版本将在 8 月 21 日发布",
    slogan: ["笔起思涌", "图见真意"],
    description: "次世代的节点图绘制工具",
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

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  function t<T extends keyof (typeof translations)[keyof typeof translations]>(
    key: T,
  ): (typeof translations)[keyof typeof translations][T] {
    return translations[lang as keyof typeof translations][key];
  }

  return (
    <main className="container flex min-h-full flex-col items-center gap-8 py-28">
      {/* news */}
      <div className="flex rounded-full border border-blue-400 px-3 py-1 text-sm opacity-50 transition hover:scale-110 hover:opacity-100">
        {t("news")}
      </div>
      {/* slogan */}
      <h1 className="flex flex-col items-center bg-gradient-to-br from-blue-400 to-lime-500 bg-clip-text text-7xl font-semibold leading-tight text-transparent">
        {t("slogan").map((word, index) => (
          <span key={index}>{word}</span>
        ))}
      </h1>
      {/* description */}
      <h2 className="text-xl opacity-60">{t("description")}</h2>
      {/* links */}
      <DynamicLink
        href="/docs/app"
        className="rounded-xl border-t-2 border-white/50 bg-gradient-to-br from-blue-500 to-lime-700 px-4 py-3 transition hover:-translate-y-1"
      >
        {t("start")}
      </DynamicLink>
      {/* video */}
      {lang === "zh-CN" && (
        <div className="mt-8 flex w-full flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-lg opacity-75">
            <PlayCircle />
            {t("video")}
          </div>
          <iframe
            src="https://player.bilibili.com/player.html?aid=113667215527700&poster=1&autoplay=0"
            className="aspect-video w-96 rounded-3xl transition-all hover:w-full"
          />
        </div>
      )}
    </main>
  );
}
