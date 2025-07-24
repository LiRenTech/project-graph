import { check, Update } from "@tauri-apps/plugin-updater";
import { Check, Download, Loader2 } from "lucide-react";
import MarkdownIt from "markdown-it";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/Button";
import { Dialog } from "../../../../components/dialog";
import { cn } from "../../../../utils/cn";

export default function Introduction() {
  const [checkingUpdate, setCheckingUpdate] = useState(true);
  const [update, setUpdate] = useState<Update | null>(null);

  useEffect(() => {
    check().then((update) => {
      setCheckingUpdate(false);
      setUpdate(update);
    });
  }, []);

  return (
    <div className="relative flex size-full flex-col gap-4 overflow-y-auto">
      <CheckingUpdates isLatest={!checkingUpdate && !update} />
      <UpdateAvailable update={update} />
      <Paragraph i18nKey="intro" />
      <Paragraph i18nKey="ideaSources" />
      <Paragraph i18nKey="team" />
      <Paragraph i18nKey="contact" />
    </div>
  );
}

function CheckingUpdates({ isLatest }: { isLatest: boolean }) {
  return (
    <div className="rounded-4xl flex items-center gap-2 bg-gradient-to-br from-purple-950 via-blue-950 to-green-950 p-4">
      {isLatest ? (
        <>
          <Check />
          已是最新版本
        </>
      ) : (
        <>
          {" "}
          <Loader2 className="animate-spin" />
          检查更新中……
        </>
      )}
    </div>
  );
}

function UpdateAvailable({ update }: { update: Update | null }) {
  const updateBodyHtml = useMemo(() => {
    if (!update) return "";
    return MarkdownIt({
      breaks: true,
    }).render(update.body ?? "");
  }, [update]);
  const [downloading, setDownloading] = useState(false);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  const install = () => {
    setDownloading(true);
    update
      ?.downloadAndInstall((progress) => {
        switch (progress.event) {
          case "Started":
            setTotalSize(progress.data.contentLength ?? 0);
            break;
          case "Progress":
            setDownloadedSize((prev) => prev + (progress.data.chunkLength ?? 0));
            break;
          case "Finished":
            // setDownloading(false);
            break;
        }
      })
      .catch((e) => {
        setDownloading(false);
        Dialog.show({
          type: "error",
          title: "下载失败",
          content: e,
        });
      });
  };

  return (
    <div
      className={cn(
        "rounded-4xl absolute bottom-0 left-0 right-0 top-0 z-10 flex origin-top flex-col gap-4 bg-gradient-to-br from-purple-950 via-blue-950 to-green-950 p-8 duration-1000",
        update ? "scale-y-100" : "scale-y-0",
      )}
    >
      <h1 className="text-3xl font-bold">新版本可用</h1>
      <h2 className="text-xl">{update?.version}</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: updateBodyHtml,
        }}
        className="flex-1 overflow-y-auto rounded-xl bg-black/20 p-4"
      ></div>
      <div className="flex flex-col items-center gap-2">
        {downloading ? (
          <>
            <div className="h-2.5 w-full rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${(downloadedSize / totalSize) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex w-full justify-between">
              {totalSize === 0 ? (
                <span>准备中…</span>
              ) : (
                <>
                  <span>{((downloadedSize / totalSize) * 100).toFixed()}%</span>
                  <span>
                    {(downloadedSize / 1024 / 1024).toFixed(2)} MB / {(totalSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </>
              )}
            </div>
          </>
        ) : (
          <Button onClick={install}>
            <Download />
            安装更新
          </Button>
        )}
      </div>
    </div>
  );
}

function Paragraph({ i18nKey }: { i18nKey: string }) {
  const { t } = useTranslation("about");
  const data = t(i18nKey, { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-bold">
        <span className="text-panel-text">{"# "}</span>
        {data[0]}
      </h2>
      {data.slice(1).map((item, index) => (
        <p key={index} className="text-panel-details-text text-sm">
          {item}
        </p>
      ))}
    </div>
  );
}
