import { invoke } from "@tauri-apps/api/core";
import { check, Update } from "@tauri-apps/plugin-updater";
import { BookOpen, Download, MessageCircleCode } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../assets/bilibili.svg?react";
import Github from "../../assets/github.svg?react";
import icon from "../../assets/icon.png";
import QQ from "../../assets/qq.svg?react";
import versions from "../../assets/versions.json";
import Button from "../../components/Button";
import { Settings } from "../../core/service/Settings";
import { getAppVersion } from "../../utils/otherApi";
import { SettingField } from "./_field";
// 这行导入语句 open 不能删，否则会调用webview内部的窗口打开网页，非常卡
import { open } from "@tauri-apps/plugin-shell";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const [update, setUpdate] = React.useState<Update | null>(null);
  const [updating, setUpdating] = React.useState(false);
  const [newVersionFileSize, setNewVersionFileSize] = React.useState(0);
  const [newVersionDownloadedSize, setNewVersionDownloadedSize] = React.useState(0);
  const [updateChannel] = Settings.use("updateChannel");
  const { t, i18n } = useTranslation("about");

  React.useEffect(() => {
    getAppVersion().then((version) => {
      // version: string 是tauri.conf.json中填写的值

      // versions.json 列表中的每一个version字段都必须是tauri.conf.json中填写的值的前缀

      setVersion(version);
      const versionObject = versions.find((vo) => version.startsWith(vo.version));
      if (versionObject) {
        setVersionName(versionObject.name);
        setVersionNameEn(versionObject.name_en);
      } else {
        setVersionName("神秘序章");
        setVersionNameEn("Unknown Version");
      }
    });
  }, []);

  React.useEffect(() => {
    invoke("set_update_channel", { channel: updateChannel })
      .then(() => check())
      .then(setUpdate);
  }, [updateChannel]);

  return (
    <div className="flex h-full">
      <div className="flex w-64 flex-col items-center justify-center gap-4">
        <img src={icon} alt="icon" className="h-32 w-32" />
        <h1 className="text-panel-text text-3xl font-bold">Project Graph</h1>
        <p className="text-panel-details-text text-center text-sm">
          {i18n.language === "zh-CN" ? versionName + " " : ""}
          {versionNameEn}
          <br />
          {version}
        </p>
        {update && update.available && (
          <Button
            onClick={() => {
              setUpdating(true);
              update?.downloadAndInstall((event) => {
                switch (event.event) {
                  case "Started":
                    setNewVersionFileSize(event.data.contentLength ?? 0);
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
            <Download />
            {updating
              ? `${t("updater.downloading")}: ${((newVersionDownloadedSize / newVersionFileSize) * 100).toFixed()}%`
              : `${t("updater.available")}: ${update.version}`}
          </Button>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => open("https://project-graph.top")}>
            <BookOpen />
            {t("links.documentation")}
          </Button>
          <Button onClick={() => open("https://github.com/LiRenTech/project-graph")}>
            <Github />
            {t("links.github")}
          </Button>
          <Button onClick={() => open("https://www.bilibili.com/video/BV1hmHKeDE9D")}>
            <Bilibili />
            {t("links.video")}
          </Button>
          <Button
            onClick={() =>
              open(
                "https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/",
              )
            }
          >
            <QQ />
            {t("links.qq")}
          </Button>
          <Button onClick={() => open("https://forum.d2learn.org/category/16/project-graph")}>
            <MessageCircleCode />
            {t("links.forum")}
          </Button>
        </div>
      </div>
      <div className="text-panel-text flex flex-1 flex-col gap-4 overflow-auto">
        <SettingField icon={<Download />} settingKey="updateChannel" type="select" />
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
