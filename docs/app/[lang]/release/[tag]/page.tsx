import { octo } from "@/app/octo";
import Link from "fumadocs-core/link";
import { remarkHeading } from "fumadocs-core/mdx-plugins";
import { Callout } from "fumadocs-ui/components/callout";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import production from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export default async function Page(props: { params: Promise<{ tag: string; lang: string }> }) {
  const { tag, lang } = await props.params;
  const releaseResponse = await octo.request(
    tag === "latest" ? "GET /repos/{owner}/{repo}/releases/latest" : "GET /repos/{owner}/{repo}/releases/tags/{tag}",
    {
      owner: "graphif",
      repo: "project-graph",
      tag,
    },
  );
  if (releaseResponse.status !== 200) {
    notFound();
  }
  const release = releaseResponse.data;

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkHeading)
    .use(remarkRehype)
    .use(rehypeReact, production);
  const md = await processor.process(release.body);

  return (
    <DocsPage toc={md.data.toc}>
      <DocsTitle>{release.name}</DocsTitle>
      <DocsDescription className="mb-2">{new Date(release.published_at ?? "").toLocaleDateString()}</DocsDescription>
      <hr className="my-4" />
      <DocsBody>
        <div className="flex items-center gap-2 text-xl">
          <Download size={28} />
          {lang === "zh-CN" && "下载"}
          {lang === "en" && "Download"}
        </div>
        <Tabs items={["Windows", "Mac", "Linux"]}>
          <Tab value="Windows" className="flex flex-col gap-2">
            {release.assets
              .filter((asset) => asset.name.endsWith(".exe"))
              .map((asset) => {
                return <DownloadLink key={asset.name} href={asset.browser_download_url} proxy={lang === "zh-CN"} />;
              })}
          </Tab>
          <Tab value="Mac" className="flex flex-col gap-2">
            <Callout type="warn" className="border-fd-warning mb-0 border-2">
              <span className="text-fd-foreground font-bold">
                {lang === "zh-CN" && "如果打开文件时显示“应用已损坏”，请右键点击dmg文件，然后选择“打开”"}
                {lang === "en" &&
                  "If you see “The application is damaged” when opening the file, right-click the dmg file and select “Open”"}
              </span>
            </Callout>
            {release.assets
              .filter((asset) => asset.name.endsWith(".dmg"))
              .map((asset) => {
                return <DownloadLink key={asset.name} href={asset.browser_download_url} proxy={lang === "zh-CN"} />;
              })}
          </Tab>
          <Tab value="Linux" className="flex flex-col gap-2">
            {release.assets
              .filter(
                (asset) =>
                  asset.name.endsWith(".AppImage") || asset.name.endsWith(".deb") || asset.name.endsWith(".rpm"),
              )
              .map((asset) => {
                return <DownloadLink key={asset.name} href={asset.browser_download_url} proxy={lang === "zh-CN"} />;
              })}
            <Link
              href="https://aur.archlinux.org/packages/project-graph-bin"
              className="not-hover:no-underline flex w-max items-center gap-2"
            >
              <ExternalLink />
              AUR: project-graph-bin
            </Link>
          </Tab>
        </Tabs>
        <hr className="my-4" />
        {md.result}
      </DocsBody>
    </DocsPage>
  );
}

function DownloadLink({ href, proxy }: { href?: string; proxy?: boolean }) {
  return (
    href && (
      <Link
        href={proxy ? `https://ghproxy.net/${href}` : href}
        className="not-hover:no-underline flex w-max items-center gap-2"
      >
        <Download />
        {href.split("/").pop()}
      </Link>
    )
  );
}
