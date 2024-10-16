import { ArrowRight, Globe, Languages } from "lucide-react";
import { ButtonField, SettingField } from "./settings/_field";
import { useNavigate } from "../router";
import { open } from "@tauri-apps/plugin-shell";
import Github from "../assets/github.svg?react";
import Bilibili from "../assets/bilibili.svg?react";
import QQ from "../assets/qq.svg?react";
import TauriIcon from "../assets/tauri.svg?react";
import ReactIcon from "../assets/react.svg?react";
import { Camera } from "../core/stage/Camera";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-950 to-green-950">
      <main className="flex h-4/5 w-1/3 flex-col justify-center">
        <div className="mb-8">
          <span className="text-2xl text-gray-500">Welcome to</span>
          <h1 className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-5xl font-bold leading-tight text-transparent">
            Project Graph
          </h1>
        </div>
        {/* 设置语言 */}
        <SettingField
          icon={<Languages />}
          title="Language / 语言"
          settingKey="language"
          type="select"
          options={[
            { value: "en", label: "English" },
            { value: "zh-CN", label: "简体中文" },
            { value: "zh-TW", label: "繁體中文 (台灣)" },
          ]}
        />
        {/* next按钮 */}
        <ButtonField
          icon={<ArrowRight />}
          title="Finish / 完成"
          label="Go!"
          onClick={() => {
            navigate("/");
            Camera.reset();
          }}
        />
        {/* 其他链接 */}
        <ButtonField
          icon={<Globe />}
          title="Website / 网站"
          label="liren.zty012.de/project-graph"
          onClick={() => open("https://liren.zty012.de/project-graph")}
        />
        <ButtonField
          icon={<Github />}
          title="Github"
          label="LiRenTech/project-graph"
          onClick={() => open("https://github.com/LiRenTech/project-graph")}
        />
        <ButtonField
          icon={<Bilibili />}
          title="Bilibili"
          label="@__阿岳__"
          onClick={() => open("https://space.bilibili.com/480804525")}
        />
        <ButtonField
          icon={<QQ />}
          title="QQ Group"
          label="1006956704"
          onClick={() =>
            open(
              "https://qm.qq.com/cgi-bin/qm/qr?k=vYMCABse0VlRjnxxowM6jacl4PEe5IXX&jump_from=webapi&authKey=Vc/JhgAlA+p/KezseanKmN1W5BvCaGMxrRXaDXEIxyR6tvgdyvq2FDfKbI/IDNhw",
            )
          }
        />
        {/* 页脚信息 */}
        <blockquote className="mt-8 border-l-4 border-gray-500 pl-4 text-gray-500">
          Made by LiRenTech with ❤️
          <br />
          Powered by <TauriIcon className="inline-block h-6 w-6" /> and{" "}
          <ReactIcon className="inline-block h-6 w-6" />
        </blockquote>
      </main>
    </div>
  );
}
