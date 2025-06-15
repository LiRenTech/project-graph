import { BookOpenText, MessageCircleWarning, UsersRound } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../../../assets/bilibili.svg?react";
import Github from "../../../../assets/github.svg?react";
import icon from "../../../../assets/icon.png";
import versions from "../../../../assets/versions.json";
import Button from "../../../../components/Button";
import { getAppVersion } from "../../../../utils/otherApi";
// 这行导入语句 open 不能删，否则会调用webview内部的窗口打开网页，非常卡
import { open } from "@tauri-apps/plugin-shell";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../../utils/cn";
import Introduction from "./_introduction";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionNameZhCN, setVersionNameZhCN] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const { t, i18n } = useTranslation("about");

  const [clickedLogoCount, setClickedLogoCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    getAppVersion().then((version) => {
      // version: string 是tauri.conf.json中填写的值

      // versions.json 列表中的每一个version字段都必须是tauri.conf.json中填写的值的前缀
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
    if (clickedLogoCount > 7) {
      setClickedLogoCount(0);
      navigate("/info");
    }
  }, [clickedLogoCount]);

  return (
    <div className="flex h-full">
      <div className="flex w-64 flex-col items-center justify-center gap-4">
        <img
          src={icon}
          alt="icon"
          style={{
            rotate: `${clickedLogoCount * 15}deg`,
          }}
          className={cn("rounded-4xl h-32 w-32 cursor-pointer shadow-neutral-800 hover:scale-105 active:scale-95")}
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
          {i18n.language === "zh-CN" && versionNameZhCN} {versionNameEn}
          <br />
          {version}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            tooltip="https://project-graph.top/docs/app"
            onClick={() => open("https://project-graph.top/docs/app")}
          >
            <BookOpenText />
            {t("links.website")}
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
            onClick={() => open("https://project-graph.top/docs/app/community")}
            tooltip={t("links.community.description")}
          >
            <UsersRound />
            {t("links.community.title")}
          </Button>
          <Button onClick={() => open("https://project-graph.top/docs/app/announcement")}>
            <MessageCircleWarning />
            {t("links.importantAnnouncement")}
          </Button>
        </div>
      </div>
      <div className="text-panel-text flex flex-1">
        <Introduction />
      </div>
    </div>
  );
}
