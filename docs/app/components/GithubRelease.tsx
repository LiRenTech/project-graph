"use client";

import { Callout } from "fumadocs-ui/components/callout";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Download, LoaderCircle } from "lucide-react";
// import mdit from "markdown-it";
import { useEffect, useState } from "react";

export default function GithubRelease() {
  const [release, setRelease] = useState<any>(null);
  const [nightlyRelease, setNightlyRelease] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://proxy.zty012.de/https://api.github.com/repos/LiRenTech/project-graph/releases`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            // Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );
      const data = await response.json();
      let foundNightly = false;
      let foundRelease = false;
      for (const item of data) {
        if (item.prerelease) {
          console.log("nightly release", item);
          setNightlyRelease(item);
          foundNightly = true;
        } else {
          console.log("release", item);
          setRelease(item);
          foundRelease = true;
        }
        if (foundNightly && foundRelease) {
          break;
        }
      }
    };

    fetchData();
  }, []);

  if (!release) {
    return <LoaderCircle className="animate-spin" />;
  }

  return (
    <div>
      <Tabs items={["Windows", "Linux", "macOS (Intel)", "macOS (Apple Silicon)", "Android"]}>
        <Tab value="Windows">
          <FindAsset release={release} endwith=".exe" />
          <FindAsset release={nightlyRelease} endwith=".exe" />
        </Tab>
        <Tab value="Linux">
          <FindAsset release={release} endwith=".deb" />
          <FindAsset release={nightlyRelease} endwith=".deb" />
        </Tab>
        <Tab value="macOS (Intel)">
          <FindAsset release={release} endwith="x64.dmg" />
          <FindAsset release={nightlyRelease} endwith="x64.dmg" />
        </Tab>
        <Tab value="macOS (Apple Silicon)">
          <Callout type="warn">由于开发者没有 Mac 电脑，无法测试 macOS arm64 版本，所以可能无法正常运行。</Callout>
          <FindAsset release={release} endwith="aarch64.dmg" />
          <FindAsset release={nightlyRelease} endwith="aarch64.dmg" />
        </Tab>
        <Tab value="Android">
          <Callout type="warn">Android 版本目前遇到了性能瓶颈，建议在电脑上使用。</Callout>
          <FindAsset release={release} endwith=".apk" />
          <FindAsset release={nightlyRelease} endwith=".apk" />
        </Tab>
      </Tabs>
    </div>
  );
}

function FindAsset({ release, endwith }: { release: any; endwith: string }) {
  const asset = release.assets.find((asset: any) => asset.name.endsWith(endwith));

  if (!asset) {
    return <></>;
  }

  return (
    <button
      onClick={() => window.open("https://proxy.zty012.de/" + asset.browser_download_url, "_blank")}
      className="bg-fd-primary/10 not-last:mb-2 hover:bg-fd-primary/20 flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 transition"
    >
      <Download />
      <span>{release.name}</span>
    </button>
  );
}
