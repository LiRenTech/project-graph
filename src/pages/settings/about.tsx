import { open } from "@tauri-apps/plugin-shell";
import icon from "../../assets/icon.png";
import Button from "../../components/ui/Button";
import React from "react";
import { getVersion } from "@tauri-apps/api/app";
import versions from "../../assets/versions.json";
import { useTranslation } from "react-i18next";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const { t } = useTranslation("settingsAbout");

  React.useEffect(() => {
    getVersion().then((version) => {
      setVersion(version);
      const ver = versions.find((v) => version.startsWith(v.version));
      if (ver) {
        setVersionName(ver.name);
        setVersionNameEn(ver.name_en);
      } else {
        setVersionName("神秘序章");
        setVersionNameEn("Unknown Version");
      }
    });
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-20 gap-4">
        <img src={icon} alt="icon" className="h-20 w-20 rounded-xl" />
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-bold">Project Graph 计划投射</span>
          <span className="text-gray-500">
            {versionName} {versionNameEn} ({version})
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto leading-7">
        <p>{t("intro.0")}</p>
        <p>{t("intro.1")}</p>
        <p>{t("intro.2")}</p>

        <h2 className="mt-4 text-2xl font-bold">{t("contact.0")}</h2>
        <p>{t("contact.1")}</p>
        <p>{t("contact.2")}</p>
        <h2 className="mt-4 text-2xl font-bold">{t("team.0")}</h2>
        <p>{t("team.1")}</p>
        <p>{t("team.2")}</p>
        <p>{t("team.3")}</p>
        <p>{t("team.4")}</p>
        <p>{t("team.5")}</p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => open("https://liren.zty012.de/project-graph")}>
          使用文档
        </Button>
        <Button
          onClick={() => open("https://github.com/LiRenTech/project-graph")}
        >
          GitHub开源地址
        </Button>
        <Button
          onClick={() => open("https://www.bilibili.com/video/BV1hmHKeDE9D")}
        >
          Bilibili视频教程
        </Button>
        <Button
          onClick={() =>
            open(
              "https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/",
            )
          }
        >
          QQ讨论群
        </Button>
      </div>
    </div>
  );
}
