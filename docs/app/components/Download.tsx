"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { DownloadIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Download() {
  const [data, setData] = useState<{
    latest: Record<string, Record<string, string>>;
    nightly: Record<string, Record<string, string>>;
  }>({
    latest: {},
    nightly: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://release.project-graph.top")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return loading ? (
    <Loader2 className="animate-spin" />
  ) : (
    <Tabs items={["正式版", "开发版"]}>
      <Tab>
        <Downloads data={data.latest} />
      </Tab>
      <Tab>
        <Downloads data={data.nightly} />
      </Tab>
    </Tabs>
  );
}

function detectPlatformAndArch() {
  // 检测操作系统
  const platform = navigator.platform;
  let os;
  if (platform.includes("Win")) {
    os = "windows";
  } else if (platform.includes("Mac")) {
    os = "darwin";
  } else if (platform.includes("Linux")) {
    os = "linux";
  } else {
    os = "unknown";
  }

  // 检测CPU架构（间接推断）
  const userAgent = navigator.userAgent;
  let arch = "unknown";
  if (/aarch64|arm64/i.test(userAgent)) {
    arch = "aarch64";
  } else if (/x86_64|x64|win64|wow64/i.test(userAgent)) {
    arch = "x86_64";
  } else if (/x86|i386|i686|win32/i.test(userAgent)) {
    arch = "x86";
  }

  return `${os}-${arch}`;
}

const platformMap = {
  "windows-x86_64": "Windows",
  "darwin-x86_64": "macOS (Intel)",
  "darwin-aarch64": "macOS (Apple Silicon)",
  "linux-x86_64": "Linux (x86_64)",
};
const formatMap = {
  "app.tar.gz": "更新包 (普通用户请下载dmg格式)",
};

function Downloads({ data }: { data: Record<string, Record<string, string>> }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {Object.entries(data[detectPlatformAndArch()]).map(([format, url]) => (
          <a
            key={format}
            href={url}
            className="flex items-center gap-2 rounded-xl bg-slate-300 px-4 py-3 no-underline dark:bg-slate-600"
          >
            <DownloadIcon />
            <div className="flex flex-col">
              <span>{platformMap[detectPlatformAndArch() as never] ?? detectPlatformAndArch()}</span>
              <span className="mb-1 text-xs">{formatMap[format as never] ?? format}</span>
            </div>
          </a>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {Object.entries(data)
          .filter(([key]) => key !== detectPlatformAndArch())
          .map(([platform, formats]) =>
            Object.entries(formats).map(([format, url]) => (
              <a
                key={format}
                href={url}
                className="bg-fd-accent flex items-center gap-2 rounded-xl px-4 py-3 no-underline"
              >
                <DownloadIcon />
                <div className="flex flex-col">
                  <span>{platformMap[platform as never] ?? platform}</span>
                  <span className="mb-1 text-xs">{formatMap[format as never] ?? format}</span>
                </div>
              </a>
            )),
          )}
      </div>
    </div>
  );
}
