import { baseOptions } from "@/app/layout.config";
import { blog } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const pageDates = new Map<string, Date>();
  for (const page of blog.getPages()) {
    pageDates.set(page.slugs[0], page.data.date);
  }

  return (
    <DocsLayout
      tree={{
        ...blog.pageTree,
        children: blog.pageTree.children.sort((a, b) => {
          const aDate = pageDates.get(a.$id?.replace(".mdx", "") ?? "") ?? new Date();
          const bDate = pageDates.get(b.$id?.replace(".mdx", "") ?? "") ?? new Date();
          // 日期降序
          return bDate.getTime() - aDate.getTime();
        }),
      }}
      {...baseOptions}
    >
      {children}
    </DocsLayout>
  );
}
