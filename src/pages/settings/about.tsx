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

      <div className="flex-1 overflow-auto leading-7">
        <h2 className="mt-4 text-2xl font-bold">{t("introTitle")}</h2>
        <p>{t("intro.0")}</p>
        <p>{t("intro.1")}</p>
        <p>{t("intro.2")}</p>

        <h2 className="mt-4 text-2xl font-bold">{t("contact.0")}</h2>
        <p>{t("contact.1")}</p>
        <p>{t("contact.2")}</p>

        <h2 className="mt-4 text-2xl font-bold">{t("techEnvironment")}</h2>
        <div className="flex w-full gap-2">
          <span>React</span>
          <span>TypeScript</span>
          <span>Tauri</span>
          <span>TailwindCSS</span>
          <span>i18n</span>
          <span>eslint</span>
          <span>vite</span>
          <span>vitest</span>
          <span>recoil</span>
          <span>lucide</span>
          <span>xlings</span>
        </div>
        {/* 此程序基于MIT协议开源，你可以在任何地方使用，无论是个人还是商业用途，但请保留作者信息和版权信息。 */}
        <h2 className="mt-4 text-2xl font-bold">{t("developer.title")}</h2>
        <p>项目提出者：Rutubet</p>
        <p>概念设计：Littlefean</p>
        <p>功能设计：Littlefean、ZTY、Rutubet、广大的反馈者们</p>
        <p>Logo设计：Littlefean、ZTY、Rutubet</p>
        <p>UI设计：ZTY</p>
        <p>软件架构与体系设计：Rutubet、Littlefean、ZTY</p>
        <p>贝塞尔曲线设计：Rutubet</p>
        <p>动画特效设计：Littlefean</p>
        <p>自动化构建发布：ZTY</p>
        <p>自动化环境搭建：SunriseSpeak</p>
        <p>文档网站维护：ZTY</p>
        <p>性能督导：ZTY、广大的反馈者们</p>
        <p>视频宣发：Littlefean</p>
        <p className="text-sm text-gray-600">翻译官：Artificial Intelligence</p>
        <p className="text-sm text-gray-600">
          测试：Vitest、all developer、all user
        </p>
        <p className="text-sm text-gray-600">程序员鼓励师：null</p>
        <p className="text-sm text-gray-600">
          程序员鼓励师的鼓励师：maximum recursion depth exceeded
        </p>
        <p className="text-sm text-gray-600">音效师：undefined</p>
        <p className="text-sm text-gray-600">气氛调节师：yuxiaoQAQ</p>
        <p className="text-sm text-gray-600">...</p>
        <p>{t("developer.tips")}</p>

        <h2 className="mt-4 text-2xl font-bold">{t("ideaSource.title")}</h2>
        <p>未支持深色风格的FigJamBoard</p>
        <p>b站的所长林超的画分析框架详解视频</p>
        <p>《数据结构与算法》中的拓扑排序、图论</p>
        <p>大学时期一次UI设计课中老师展示的“头脑风暴法”</p>
        <p>
          游戏《Minecraft》中的“命令方块”（一键打开bat文件并直接运行的功能）
        </p>
        <p>游戏《水果忍者》中挥刀的动画效果（右键删除节点的方法灵感来源）</p>
        <h2 className="mt-4 text-2xl font-bold">彩蛋</h2>
        {/* <p>游戏《原神》中派蒙对玩家区域越界的提醒（摄像机移动超过边界）</p> */}
        <p>...</p>
        <h2 className="mt-4 text-2xl font-bold">{t("team.0")}</h2>
        <p>{t("team.1")}</p>
        <p>{t("team.2")}</p>
        <p>{t("team.3")}</p>
        <p>{t("team.4")}</p>
        <p>{t("team.5")}</p>
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
