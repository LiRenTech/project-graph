import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, Code2, Lightbulb, MessageCircleCode } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Bilibili from "../../assets/bilibili.svg?react";
import Github from "../../assets/github.svg?react";
import icon from "../../assets/icon.png";
import QQ from "../../assets/qq.svg?react";
import versions from "../../assets/versions.json";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/cn";

interface AuthorLinkProps {
  url: string;
  name: string;
}

function AuthorLink({ url, name }: AuthorLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer text-blue-400 hover:text-blue-500"
    >
      {name}
    </a>
  );
}

const Rutubet = (
  <AuthorLink url={"https://github.com/Rutubet"} name={"Rutubet"} />
);
const Littlefean = (
  <AuthorLink url={"https://github.com/Littlefean"} name={"Littlefean"} />
);
const ZTY = <AuthorLink url={"https://github.com/zty012"} name={"ZTY"} />;
const SunriseSpeak = (
  <AuthorLink url={"https://github.com/Sunrisepeak"} name={"SunriseSpeak"} />
);
const FittenCode = (
  <AuthorLink
    url={"https://code.fittentech.com?ref=ay"}
    name={"Artificial Intelligence"}
  />
);
const Vitest = (
  <AuthorLink url={"https://github.com/vitest-dev/vitest"} name={"Vitest"} />
);
const Lucide = <AuthorLink url={"https://lucide.dev/icons/"} name={"lucide"} />;

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const { t, i18n } = useTranslation("about");

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
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-20 gap-4">
        <img src={icon} alt="icon" className="h-20 w-20 rounded-xl" />
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-bold">{t("title")}</span>
          <span className="text-gray-500">
            {i18n.language === "zh-CN" && versionName} {versionNameEn} (
            {version})
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto">
        <Card title={t("intro.0")}>
          {t("intro", { joinArrays: "\n" })
            .split("\n")
            .map((v, i) => i > 0 && <p key={i}>{v}</p>)}
        </Card>
        <Card title={t("contact.0")}>
          {t("contact", { joinArrays: "\n" })
            .split("\n")
            .map((v, i) => i > 0 && <p key={i}>{v}</p>)}
        </Card>
        <div className="grid grid-cols-4 gap-4">
          <Card title={t("developers.title")} className="bg-blue-500/20">
            <Code2 />
          </Card>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {/* <Card title={t("developers.title")} className="bg-blue-500/20">
            <Code2 />
          </Card> */}
          <Card title={t("developers.proposer")}>
            {Rutubet}, {Littlefean}
          </Card>
          <Card title={t("developers.conceptDesigner")}>{Littlefean}</Card>
          <Card title={t("developers.featureDesigner")}>
            {Littlefean}, {ZTY}, {Rutubet}, feedbackers
          </Card>
          <Card title={t("developers.feedbackManager")}>
            {Littlefean}, {ZTY}
          </Card>
          <Card title={t("developers.logoDesigner")}>
            {Littlefean}, {ZTY}, {Rutubet}, {Lucide}
          </Card>
          <Card title={t("developers.uiDesigner")}>{ZTY}</Card>
          <Card title={t("developers.softwareArchitect")}>
            {Rutubet}, {Littlefean}, {ZTY}
          </Card>
          <Card title={t("developers.bezierCurveDesigner")}>{Rutubet}</Card>
          <Card title={t("developers.animationEffectDesigner")}>
            {Littlefean}
          </Card>
          <Card title={t("developers.automationBuilder")}>{ZTY}</Card>
          <Card title={t("developers.xlings")}>{SunriseSpeak}</Card>
          <Card title={t("developers.websiteMaintainer")}>{ZTY}</Card>
          <Card title={t("developers.performanceSupervisor")}>
            {ZTY}, feedbackers
          </Card>
          <Card title={t("developers.videoPromoter")}>{Littlefean}</Card>
          <Card title={t("developers.translator")}>{FittenCode}</Card>
          <Card title={t("developers.tester")}>
            {Vitest}, all developer, all user
          </Card>
          <Card title={t("developers.encourager")}>
            <span className="animate-pulse text-xs text-neutral-500">
              just generate energy with love
            </span>
          </Card>
          <Card title={t("developers.encouragerEncourager")}>
            <div className="relative">
              <div className="absolute animate-ping text-xs text-red-700">
                maximum recursion depth exceeded
              </div>
              <div className="absolute text-xs text-red-700">
                maximum recursion depth exceeded
              </div>
            </div>
          </Card>
          <Card title={t("developers.atmosphereAdjuster")}>yuxiaoQAQ</Card>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card title={t("ideaSources.0")} className="bg-blue-500/20">
            <Lightbulb />
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* <Card title={t("ideaSources.0")} className="bg-blue-500/20">
            <Lightbulb />
          </Card> */}
          {t("ideaSources", { joinArrays: "\n" })
            .split("\n")
            .map((v, i) => i > 0 && <Card key={i}>{v}</Card>)}
        </div>

        <Card title={t("team.0")}>
          {t("team", { joinArrays: "\n" })
            .split("\n")
            .map((v, i) => i > 0 && <p key={i}>{v}</p>)}
        </Card>
      </div>
      <div className="flex gap-2">
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
  );
}

function Card({
  title = "",
  children,
  className = "",
}: React.PropsWithChildren<{
  title?: string;
  className?: string;
}>) {
  return (
    <div className={cn("relative rounded-xl bg-white/5 p-4", className)}>
      <h1 className="text-xl font-bold text-neutral-50">{title}</h1>
      <div className="text-neutral-300">{children}</div>
    </div>
  );
}
