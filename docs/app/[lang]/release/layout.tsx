import { baseOptions } from "@/app/layout.config";
import { octo } from "@/app/octo";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Tag, TestTube2 } from "lucide-react";
import type { ReactNode } from "react";

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const releases = (
    await octo.request("GET /repos/{owner}/{repo}/releases", {
      owner: "graphif",
      repo: "project-graph",
      per_page: 500,
    })
  ).data;

  return (
    <DocsLayout
      {...baseOptions(lang)}
      tree={{
        name: "",
        children: [
          {
            type: "folder",
            name: "Pre-release",
            icon: <TestTube2 />,
            defaultOpen: false,
            children: releases
              .filter((release) => release.prerelease)
              .map((release) => ({
                type: "page",
                name: release.name,
                url: `/release/${release.tag_name}`,
              })),
          },
          {
            type: "folder",
            name: "Release",
            icon: <Tag />,
            defaultOpen: true,
            children: releases
              .filter((release) => !release.prerelease)
              .map((release) => ({
                type: "page",
                name: release.name,
                url: `/release/${release.tag_name}`,
              })),
          },
        ],
      }}
    >
      {children}
    </DocsLayout>
  );
}
