import Logo from "@/app/components/Logo";
import { baseOptions } from "@/app/layout.config";
import Link from "fumadocs-core/link";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { NavbarMenu, NavbarMenuContent, NavbarMenuLink, NavbarMenuTrigger } from "fumadocs-ui/layouts/home/navbar";
import { AlbumIcon, Braces, Code, Cpu, GitPullRequestArrow } from "lucide-react";
import type { ReactNode } from "react";

export default async function Layout({ params, children }: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const { lang } = await params;

  return (
    <HomeLayout
      style={
        {
          "--spacing-fd-container": "1120px",
        } as object
      }
      {...baseOptions(lang)}
      links={[
        {
          type: "custom",
          on: "nav",
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>
                <Link href="/docs/app">文档</Link>
              </NavbarMenuTrigger>
              <NavbarMenuContent className="text-[15px]">
                <NavbarMenuLink href="/docs/app" className="overflow-hidden md:row-span-2">
                  <div className="-z-10 max-h-[200px] rounded-t-lg blur-2xl">
                    <Logo />
                  </div>
                  <p className="font-medium">开始使用</p>
                  <p className="text-fd-muted-foreground text-sm">下载和安装 Project Graph</p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/contribute" className="lg:col-start-2">
                  <GitPullRequestArrow className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
                  <p className="font-medium">贡献</p>
                  <p className="text-fd-muted-foreground text-sm">为 Project Graph 贡献代码</p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/core" className="lg:col-start-2">
                  <Cpu className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
                  <p className="font-medium">核心</p>
                  <p className="text-fd-muted-foreground text-sm">核心代码文档</p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/serializer" className="lg:col-start-3 lg:row-start-1">
                  <Braces className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
                  <p className="font-medium">@graphif/serializer</p>
                  <p className="text-fd-muted-foreground text-sm">序列化和反序列化 JS 对象</p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/ui/manual-installation" className="lg:col-start-3 lg:row-start-2">
                  <Code className="bg-fd-primary text-fd-primary-foreground mb-2 rounded-md p-1" />
                  <p className="font-medium">@graphif/unplugin-original-class-name</p>
                  <p className="text-fd-muted-foreground text-sm">在压缩后的代码中保留类名</p>
                </NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
        {
          icon: <AlbumIcon />,
          text: "博客",
          url: "/blog",
          active: "nested-url",
        },
        {
          icon: <AlbumIcon />,
          text: "更新日志",
          url: "/release",
          active: "nested-url",
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
