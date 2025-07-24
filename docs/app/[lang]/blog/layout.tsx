import { baseOptions } from "@/app/layout.config";
import { blog } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const pageDates = new Map<string, Date>();
  for (const page of blog.getPages()) {
    pageDates.set(page.slugs[0], page.data.date);
  }

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={{
        ...blog.pageTree,
        children: blog.pageTree.children.sort((a, b) => {
          const aDate = pageDates.get(a.$id?.replace(".mdx", "") ?? "") ?? new Date();
          const bDate = pageDates.get(b.$id?.replace(".mdx", "") ?? "") ?? new Date();
          // 日期降序
          return bDate.getTime() - aDate.getTime();
        }),
      }}
    >
      {children}
    </DocsLayout>
  );
}
