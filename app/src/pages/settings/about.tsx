import { check, Update } from "@tauri-apps/plugin-updater";
import { BookOpen, Download, LoaderPinwheel, MessageCircleCode } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../assets/bilibili.svg?react";
import Github from "../../assets/github.svg?react";
import icon from "../../assets/icon.png";
import QQ from "../../assets/qq.svg?react";
import versions from "../../assets/versions.json";
import Button from "../../components/Button";
import { getAppVersion } from "../../utils/otherApi";
// 这行导入语句 open 不能删，否则会调用webview内部的窗口打开网页，非常卡
import { open } from "@tauri-apps/plugin-shell";
import { useNavigate } from "react-router-dom";
import { Dialog } from "../../components/dialog";
import { cn } from "../../utils/cn";

export default function About() {
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const [isCheckingUpdateSuccess, setIsCheckingUpdateSuccess] = React.useState(false);

  const [version, setVersion] = React.useState("");
  const [versionNameZhCN, setVersionNameZhCN] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const [update, setUpdate] = React.useState<Update | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [newVersionFileSize, setNewVersionFileSize] = React.useState(0);
  const [newVersionDownloadedSize, setNewVersionDownloadedSize] = React.useState(0);
  const { t } = useTranslation("about");

  const [clickedLogoCount, setClickedLogoCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    getAppVersion().then((version) => {
      // version: string 是tauri.conf.json中填写的值

      // versions.json 列表中的每一个version字段都必须是tauri.conf.json中填写的值的前缀
      setIsCheckingUpdate(true);
      setVersion(version);
      const versionObject = versions.find((vo) => version.startsWith(vo.version));
      if (versionObject) {
        setVersionNameZhCN(versionObject.name);
        setVersionNameEn(versionObject.name_en);
      } else {
        setVersionNameZhCN("神秘序章");
        setVersionNameEn("Unknown Version");
      }
    });
  }, []);

  React.useEffect(() => {
    check()
      .then(setUpdate)
      .then(() => {
        // 检查成功，显示更新提示
        setIsCheckingUpdate(false);
        setIsCheckingUpdateSuccess(true);
      })
      .catch(() => {
        // 检查失败，显示错误提示
        setIsCheckingUpdate(false);
        setIsCheckingUpdateSuccess(false);
      });
  }, []);

  React.useEffect(() => {
    if (clickedLogoCount > 7) {
      setClickedLogoCount(0);
      navigate("/info");
    }
  }, [clickedLogoCount]);
  const getRateString = () => {
    const rate = newVersionDownloadedSize / newVersionFileSize;
    if (isNaN(rate)) {
      return "连接中……";
    }
    return `${(rate * 100).toFixed()}%`;
  };
  return (
    <div className="flex h-full">
      <div className="flex w-64 flex-col items-center justify-center gap-4">
        <img
          src={icon}
          alt="icon"
          style={{
            rotate: `${clickedLogoCount * 15}deg`,
          }}
          className={cn(
            "rounded-4xl h-32 w-32 cursor-pointer shadow-neutral-800 hover:scale-105 active:scale-95",
            !isCheckingUpdate && "shadow-xl",
          )}
          onClick={() => {
            setClickedLogoCount(clickedLogoCount + 1);
          }}
        />
        <h1
          className="text-panel-text text-3xl font-bold"
          onClick={() => {
            console.log("goto test");
            navigate("/test");
          }}
        >
          Project Graph
        </h1>
        <p className="text-panel-details-text text-center text-sm">
          {/* {i18n.language === "zh-CN" ?  : ""} */}
          {/* 先中文和英文都显示吧。因为之前发现windows上看不到中文版本号名称 */}
          {versionNameZhCN + " " + versionNameEn}
          <br />
          {version}
        </p>
        {isCheckingUpdate && (
          <p className="text-panel-details-text animate-pulse text-center text-sm">{t("updater.checkingUpdate")}</p>
        )}
        {!isCheckingUpdate && !isCheckingUpdateSuccess && (
          <p className="text-panel-details-text animate-pulse text-center text-sm">{t("updater.checkUpdateFail")}</p>
        )}
        {update && update.available && (
          <Button
            className={cn(!updating && "animate-bounce")}
            disabled={updating}
            tooltip={"点击后什么也不用做，就可以自动更新到最新版本并自动重启软件"}
            onClick={() => {
              if (updating) {
                // 防止重复下载
                Dialog.show({
                  title: t("updater.downloading"),
                  content: "不要重复点击",
                });
                return;
              }
              setUpdating(true);
              update?.downloadAndInstall((event) => {
                switch (event.event) {
                  case "Started":
                    setNewVersionFileSize(event.data.contentLength ?? 0);
                    console.log("Started", event.data.contentLength);
                    break;
                  case "Progress":
                    setNewVersionDownloadedSize((prev) => prev + (event.data.chunkLength ?? 0));
                    break;
                  case "Finished":
                    setUpdating(false);
                    break;
                }
              });
            }}
          >
            {updating ? <LoaderPinwheel className="animate-spin" /> : <Download />}
            {updating
              ? `${t("updater.downloading")}: ${getRateString()}`
              : `${t("updater.available")}: ${update.version}`}
          </Button>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button tooltip="https://project-graph.top" onClick={() => open("https://project-graph.top")}>
            <BookOpen />
            {t("links.documentation")}
          </Button>
          <Button
            tooltip="https://github.com/LiRenTech/project-graph"
            onClick={() => open("https://github.com/LiRenTech/project-graph")}
          >
            <Github />
            {t("links.github")}
          </Button>
          <Button
            tooltip="https://www.bilibili.com/video/BV1hmHKeDE9D"
            onClick={() => open("https://www.bilibili.com/video/BV1hmHKeDE9D")}
          >
            <Bilibili />
            {t("links.video")}
          </Button>
          <Button
            tooltip="1018716404"
            onClick={() =>
              Dialog.show({
                title: "QQ 交流群",
                content: "点击复制并在网页打开",
                code: `https://qm.qq.com/cgi-bin/qm/qr?k=smSidcY7O_wbU9fqAhgobcOpmTKJrZ1P&jump_from=webapi&authKey=eqX5/gvxrWlfyhu0xiLqA+yLoUPa1X5fZbbuEWdqB+JzBR7TO6/XY1e69QwtQ/sn`,
              })
            }
          >
            <QQ />
            {t("links.qq")}
          </Button>
          <Button
            tooltip="https://forum.d2learn.org/category/16/project-graph"
            onClick={() => open("https://forum.d2learn.org/category/16/project-graph")}
          >
            <MessageCircleCode />
            {t("links.forum")}
          </Button>
        </div>
      </div>
      <div className="text-panel-text flex flex-1 flex-col gap-4 overflow-auto">
        <Paragraph i18nKey="intro" />
        <Paragraph i18nKey="ideaSources" />
        <Paragraph i18nKey="team" />
        <Paragraph i18nKey="contact" />
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
