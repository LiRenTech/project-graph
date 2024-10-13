import { open } from "@tauri-apps/plugin-shell";
import icon from "../../assets/icon.png";
import Button from "../../components/ui/Button";
import React from "react";
import { getVersion } from "@tauri-apps/api/app";
import versions from "../../assets/versions.json";

export default function About() {
  const [version, setVersion] = React.useState("");
  const [versionName, setVersionName] = React.useState("");
  const [versionNameEn, setVersionNameEn] = React.useState("");

  React.useEffect(() => {
    getVersion().then((version) => {
      setVersion(version);
      const ver = versions.find((v) => v.version.startsWith(version));
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
        <p>
          这是一个快速绘制节点图的工具，可以用于项目拓扑图绘制、快速头脑风暴草稿
        </p>
        <p>
          Xmind 只能用来绘制树形结构图，FigJam 和 draw.io
          可以用来绘制但网页打开有点慢了
        </p>
        <p>所以做了这个小软件</p>
        <h2 className="mt-4 text-2xl font-bold">联系我们</h2>
        <p>
          我们致力于为 “图论”
          设计一个最快速方便的绘制方法论，同时也在可视化思考、拓扑型todo
          list等方向进行探索创新。
        </p>
        <p>
          如果您想快速获得反馈和提供建议，或者有任何想法、疑问，欢迎加入我们的QQ群：1006956704
        </p>
        <h2 className="mt-4 text-2xl font-bold">团队简介</h2>
        <p>
          理刃科技是一个由Littlefean和Rutubet在2017年5月1日创立的小型团队，后续ZTY加入团队。
        </p>
        <p>
          以其年轻化的团队氛围、对创新创意的重视、以及理性思维与文化包容的特点，在软件开发领域独树一帜。
        </p>
        <p>
          不仅专注于开发工具软件和游戏，还涉足Minecraft游戏插件开发、游戏服务器运营以及网站建设等多元化业务。
        </p>
        <p>
          理刃科技的代表作品包括CannonWar这个内容丰富的塔防游戏、BitMountain算法竞赛网站、Watch小桌面软件，以及MinecraftPvP职业战争服务器。
        </p>
        <p>
          团队以浅蓝色和代码绿为代表颜色，象征着逻辑合理与整活幽默并存的团队文化。
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => open("https://github.com/LiRenTech/project-graph")}
        >
          GitHub
        </Button>
        <Button
          onClick={() => open("https://www.bilibili.com/video/BV1hmHKeDE9D")}
        >
          Bilibili
        </Button>
        <Button onClick={() => open("https://liren.zty012.de/project-graph")}>
          Website
        </Button>
        <Button onClick={() => open("https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/")}>
          QQ群
        </Button>
      </div>
    </div>
  );
}
