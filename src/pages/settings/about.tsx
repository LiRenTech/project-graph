import { open } from "@tauri-apps/plugin-shell";
import icon from "../../assets/icon.png";
import Button from "../../components/ui/Button";

export default function About() {
  return (
    <div>
      <div className="flex h-20 gap-4">
        <img src={icon} alt="icon" className="rounded-xl" />
        <div className="flex flex-col gap-2">
          <span className="text-3xl font-bold">Project Graph</span>
          <span className="text-gray-500">By LiRen Tech</span>
        </div>
      </div>
      <div className="mt-4">
        <p>
          这是一个快速绘制节点图的工具，可以用于项目拓扑图绘制、快速头脑风暴草稿
        </p>
        <p>
          Xmind只能用来绘制树形结构图、FigJamBoard可以用来绘制但网页打开有点慢了
        </p>
        <p>所以做了这个小软件</p>
      </div>
      <div className="mt-4 flex gap-4">
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
      </div>
    </div>
  );
}
