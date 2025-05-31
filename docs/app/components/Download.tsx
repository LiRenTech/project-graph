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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://release.project-graph.top")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`网络请求失败: ${res.status}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <p>获取下载链接失败，请联系开发者，或从Github Release界面或网盘下载</p>
      </div>
    );
  }

  return (
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

// function detectPlatformAndArch() {
//   // 检测操作系统
//   const platform = navigator.platform;
//   let os;
//   if (platform.includes("Win")) {
//     os = "windows";
//   } else if (platform.includes("Mac")) {
//     os = "darwin";
//   } else if (platform.includes("Linux")) {
//     os = "linux";
//   } else {
//     os = "unknown";
//   }

//   // 检测CPU架构（间接推断）
//   const userAgent = navigator.userAgent;
//   let arch = "unknown";
//   if (/aarch64|arm64/i.test(userAgent)) {
//     arch = "aarch64";
//   } else if (/x86_64|x64|win64|wow64/i.test(userAgent)) {
//     arch = "x86_64";
//   } else if (/x86|i386|i686|win32/i.test(userAgent)) {
//     arch = "x86";
//   }

//   return `${os}-${arch}`;
// }

const platformMap = {
  "windows-x86_64": "Windows",
  "darwin-x86_64": "macOS (Intel)",
  "darwin-aarch64": "macOS (Apple Silicon)",
  "linux-x86_64": "Linux (x86_64)",
};
const formatMap = {
  "app.tar.gz": "更新包 (普通用户请下载dmg格式)",
};

const windows10 = (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
    <path
      fill="#0078D4"
      d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z"
    />
  </svg>
);

const linux = (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
    <g fill="#ffffff" fillRule="evenodd" clipRule="evenodd">
      <path d="M9.25 19a.75.75 0 0 1 .75-.75h10.25a.75.75 0 0 1 0 1.5H10a.75.75 0 0 1-.75-.75m-2.645-2.5a.75.75 0 0 1 .75.75V19a.75.75 0 0 1-1.5 0v-1.75a.75.75 0 0 1 .75-.75m0-12a.75.75 0 0 1 .75.75V7a.75.75 0 1 1-1.5 0V5.25a.75.75 0 0 1 .75-.75" />
      <path d="M2.965 9.51c0-1.907 1.753-3.208 3.707-3.208c1.925 0 3.449 1.143 3.746 2.456a.75.75 0 1 1-1.464.33c-.103-.457-.865-1.286-2.282-1.286c-1.39 0-2.207.87-2.207 1.707c0 .257.06.428.145.558c.09.138.233.272.456.404c.45.267 1.061.44 1.816.654l.138.04c.755.215 1.655.48 2.356.97c.76.532 1.289 1.33 1.289 2.503c0 .968-.578 1.772-1.302 2.302a4.62 4.62 0 0 1-2.691.862c-1.995 0-3.446-1.237-3.888-2.655a.75.75 0 1 1 1.432-.447c.244.782 1.107 1.602 2.456 1.602c.678 0 1.333-.227 1.805-.573c.48-.35.688-.753.688-1.091c0-.634-.247-.992-.65-1.274c-.46-.323-1.111-.53-1.906-.757l-.19-.053c-.691-.196-1.49-.421-2.118-.793a2.8 2.8 0 0 1-.95-.877a2.5 2.5 0 0 1-.386-1.375" />
    </g>
  </svg>
);
const macos = (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      fill="#78909c"
      d="M25.425 26.498c-1.162 1.736-2.394 3.43-4.27 3.458c-1.875.042-2.477-1.106-4.605-1.106c-2.142 0-2.8 1.078-4.578 1.148c-1.834.07-3.22-1.848-4.396-3.542C5.183 23 3.35 16.63 5.813 12.346a6.84 6.84 0 0 1 5.767-3.514c1.792-.028 3.5 1.217 4.606 1.217c1.092 0 3.164-1.497 5.334-1.273a6.5 6.5 0 0 1 5.095 2.771a6.38 6.38 0 0 0-3.01 5.334a6.18 6.18 0 0 0 3.752 5.656a15.5 15.5 0 0 1-1.932 3.961M17.432 4.1A6.36 6.36 0 0 1 21.548 2a6.13 6.13 0 0 1-1.456 4.466a5.11 5.11 0 0 1-4.13 1.988a5.98 5.98 0 0 1 1.47-4.354"
    />
  </svg>
);
function Downloads({ data }: { data: Record<string, Record<string, string>> }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center">
        <p>获取下载链接失败，请联系开发者，或从Github Release界面或网盘下载</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {/* <div className="flex flex-wrap gap-3">
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
      </div> */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(data)
          // .filter(([key]) => key !== detectPlatformAndArch())
          .map(([platform, formats]) =>
            Object.entries(formats).map(([format, url]) => (
              <a
                key={format}
                href={url}
                className="bg-fd-accent flex items-center gap-2 rounded-xl px-4 py-3 no-underline"
              >
                <DownloadIcon />
                <div className="flex flex-col">
                  {platform === "windows-x86_64" && windows10}
                  {platform === "linux-x86_64" && linux}
                  {(platform === "darwin-x86_64" || platform === "darwin-aarch64") && macos}
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
