import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { Code2, Lightbulb } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import icon from "../../assets/icon.png";
import versions from "../../assets/versions.json";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/cn";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");
  const { t } = useTranslation("settingsAbout");

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
          <span className="text-3xl font-bold">Project Graph 计划投射</span>
          <span className="text-gray-500">
            {versionName} {versionNameEn} ({version})
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto">
        <Card title={t("introTitle")}>
          <p>{t("intro.0")}</p>
          <p>{t("intro.1")}</p>
          <p>{t("intro.2")}</p>
        </Card>
        <Card title={t("contact.0")}>
          <p>{t("contact.1")}</p>
          <p>{t("contact.2")}</p>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <Card title="开发者名单" className="bg-blue-500/20">
            <Code2 />
          </Card>
          <Card title="项目提出者">Rutubet</Card>
          <Card title="理念设计">Littlefean</Card>
          <Card title="功能设计">Littlefean, ZTY, Rutubet, 广大的反馈者们</Card>
          <Card title="反馈管理">Littlefean, ZTY</Card>
          <Card title="Logo设计">Littlefean, ZTY, Rutubet</Card>
          <Card title="UI设计">ZTY</Card>
          <Card title="软件架构与体系设计">Rutubet, Littlefean, ZTY</Card>
          <Card title="贝塞尔曲线设计">Rutubet</Card>
          <Card title="动画特效设计">Littlefean</Card>
          <Card title="自动化构建发布">ZTY</Card>
          <Card title="自动化环境搭建">SunriseSpeak</Card>
          <Card title="文档网站维护">ZTY</Card>
          <Card title="性能督导">ZTY, 广大的反馈者们</Card>
          <Card title="视频宣发">Littlefean</Card>
          <Card title="翻译官">Artificial Intelligence</Card>
          <Card title="测试">Vitest, all developer, all user</Card>
          <Card title="程序员鼓励师">null</Card>
          <Card title="程序员鼓励师的鼓励师">
            maximum recursion depth exceeded
          </Card>
          <Card title="气氛调节师">yuxiaoQAQ</Card>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card title="灵感来源" className="bg-blue-500/20">
            <Lightbulb />
          </Card>
          <Card title="">未支持深色风格的FigJamBoard</Card>
          <Card title="">b站的所长林超的画分析框架详解视频</Card>
          <Card title="">《数据结构与算法》中的拓扑排序、图论</Card>
          <Card title="">大学时期一次UI设计课中老师展示的“头脑风暴法”</Card>
          <Card title="">
            游戏《Minecraft》中的“命令方块”（一键打开bat文件并直接运行的功能）
          </Card>
          <Card title="">
            游戏《水果忍者》中挥刀的动画效果（右键删除节点的方法灵感来源）
          </Card>
        </div>

        <Card title={t("team.0")}>
          <p>{t("team.1")}</p>
          <p>{t("team.2")}</p>
          <p>{t("team.3")}</p>
          <p>{t("team.4")}</p>
          <p>{t("team.5")}</p>
        </Card>
      </div>
      <div className="flex gap-2">
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
        <Button
          onClick={() =>
            open("https://forum.d2learn.org/category/16/project-graph")
          }
        >
          论坛
        </Button>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: React.PropsWithChildren<{
  title: string;
  className?: string;
}>) {
  return (
    <div className={cn("rounded-xl bg-white/5 p-4", className)}>
      <h1 className="text-xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
