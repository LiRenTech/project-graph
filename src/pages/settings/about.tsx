import { check, Update } from "@tauri-apps/plugin-updater";
import { BookOpen, Download, MessageCircleCode } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../assets/bilibili.svg?react";
import Github from "../../assets/github.svg?react";
import icon from "../../assets/icon.png";
import QQ from "../../assets/qq.svg?react";
import versions from "../../assets/versions.json";
import Button from "../../components/ui/Button";
import { getVersion } from "../../utils/otherApi";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const [update, setUpdate] = React.useState<Update | null>(null);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    getVersion().then((version) => {
      // version: string 是tauri.conf.json中填写的值

      // versions.json 列表中的每一个version字段都必须是tauri.conf.json中填写的值的前缀

      setVersion(version);
      const versionObject = versions.find((vo) =>
        version.startsWith(vo.version),
      );
      if (versionObject) {
        setVersionName(versionObject.name);
        setVersionNameEn(versionObject.name_en);
      } else {
        setVersionName("神秘序章");
        setVersionNameEn("Unknown Version");
      }
    });
    check().then(setUpdate);
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex w-64 flex-col items-center justify-center gap-4">
        <img src={icon} alt="icon" className="h-32 w-32" />
        <h1 className="text-3xl font-bold">Project Graph</h1>
        <p className="text-center text-sm text-neutral-500">
          {versionName} {versionNameEn}
          <br />
          {version}
        </p>
        {update && update.available && (
          <Button
            onClick={() => {
              setUpdating(true);
              update?.downloadAndInstall().then(() => {
                setUpdating(false);
              });
            }}
          >
            <Download />
            {updating ? "正在下载..." : `新版本: ${update.version}`}
          </Button>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => open("https://project-graph.top")}>
            <BookOpen />
            文档
          </Button>
          <Button
            onClick={() => open("https://github.com/LiRenTech/project-graph")}
          >
            <Github />
            开源
          </Button>
          <Button
            onClick={() => open("https://www.bilibili.com/video/BV1hmHKeDE9D")}
          >
            <Bilibili />
            视频教程
          </Button>
          <Button
            onClick={() =>
              open(
                "https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/",
              )
            }
          >
            <QQ />
            讨论群
          </Button>
          <Button
            onClick={() =>
              open("https://forum.d2learn.org/category/16/project-graph")
            }
          >
            <MessageCircleCode />
            论坛
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-auto">
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
        <span className="text-neutral-500">{"# "}</span>
        {data[0]}
      </h2>
      {data.slice(1).map((item, index) => (
        <p key={index} className="text-sm text-neutral-500">
          {item}
        </p>
      ))}
    </div>
  );
}
