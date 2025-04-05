"use client";

import { useRouter } from "fumadocs-core/framework";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useRef } from "react";
import Logo from "../components/Logo";

export default function HomePage() {
  const router = useRouter();
  const button1 = useRef<HTMLButtonElement>(null);
  const button2 = useRef<HTMLButtonElement>(null);

  async function scaleButton(el: HTMLButtonElement, targetColor: string) {
    const rect = el.getBoundingClientRect();
    // 把元素复制一份占位
    const clone = el.cloneNode(true) as HTMLButtonElement;
    clone.style.opacity = "0";
    el.parentElement?.insertBefore(clone, el);
    el.style.position = "fixed";
    // 背景模糊
    const blur = document.createElement("div");
    blur.style.position = "fixed";
    blur.style.top = "0";
    blur.style.left = "0";
    blur.style.width = "100%";
    blur.style.height = "100%";
    blur.style.zIndex = "99";
    document.querySelector("#nd-home-layout")?.appendChild(blur);
    blur.animate(
      [
        {
          backdropFilter: "blur(0px)",
          background: "rgba(0, 0, 0, 0)",
        },
        {
          backdropFilter: "blur(30px)",
          background: "rgba(0, 0, 0, 0.5)",
        },
      ],
      {
        duration: 1000,
        fill: "forwards",
      },
    );
    el.animate(
      [
        {
          color: "transparent",
          background: targetColor,
        },
      ],
      {
        duration: 300,
        fill: "forwards",
      },
    );
    el.animate(
      [
        {
          zIndex: 100,
          top: `${rect.top}px`,
          left: `${rect.left}px`,
        },
        {
          zIndex: 100,
          top: `${(window.innerHeight - rect.height) / 2}px`,
          left: `${(window.innerWidth - rect.width) / 2}px`,
        },
      ],
      {
        duration: 500,
        easing: "cubic-bezier(0.33, 1, 0.68, 1)",
        fill: "forwards",
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 30));
    el.animate(
      [
        {
          transform: `scale(${window.innerHeight / rect.height})`,
          borderRadius: "0.5rem",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return (
    <main className="flex px-52 py-32">
      <div className="max-w-1/2 flex flex-col gap-8">
        <h1 className="-z-20 bg-gradient-to-r from-blue-500 to-lime-600 bg-clip-text text-7xl font-bold leading-tight text-transparent">
          Project Graph
        </h1>
        <h2 className="text-5xl font-bold opacity-75">计划 - 投射</h2>
        <p className="text-2xl opacity-75">快速绘制节点图的桌面工具，可以用于项目进程拓扑图绘制、快速头脑风暴草稿。</p>
        <div className="flex items-center gap-4">
          <button
            ref={button1}
            onClick={async () => {
              await scaleButton(button1.current!, "var(--color-fd-background)");
              router.push("/docs/app");
            }}
            className="bg-fd-accent rounded-4xl flex cursor-pointer items-center gap-2 px-6 py-4 transition-all duration-200 active:scale-90 active:rounded-2xl"
          >
            快速开始
            <ChevronRight />
          </button>
          <button
            ref={button2}
            onClick={async () => {
              await scaleButton(button2.current!, "#212122");
              router.push("https://web.project-graph.top");
            }}
            className="bg-fd-accent rounded-4xl flex cursor-pointer items-center gap-2 px-6 py-4 transition-all duration-200 active:scale-90 active:rounded-2xl"
          >
            在线使用
            <ExternalLink />
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-center">
        <div className="relative w-1/3">
          <Logo className="size-full" />
          <Logo className="not-dark:opacity-50 absolute inset-0 -z-10 size-full scale-150 blur-2xl" />
        </div>
      </div>
    </main>
  );
}
