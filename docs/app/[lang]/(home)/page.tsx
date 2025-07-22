"use client";

import Logo from "@/app/components/Logo";
import { useRouter } from "fumadocs-core/framework";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

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
            onClick={() => {
              router.push("/docs/app");
            }}
            className="bg-fd-accent rounded-4xl flex cursor-pointer items-center gap-2 px-6 py-4 transition-all duration-200 active:scale-90 active:rounded-2xl"
          >
            快速开始
            <ChevronRight />
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
