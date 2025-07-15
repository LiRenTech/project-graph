import { deserialize, serialize } from "@graphif/serializer";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Airplay,
  AppWindow,
  Axe,
  Bot,
  CircleAlert,
  Earth,
  ExternalLink,
  File,
  FileCode,
  FileDown,
  FileImage,
  FilePlus,
  FileType,
  Folder,
  FolderClock,
  FolderCog,
  FolderOpen,
  FolderTree,
  Fullscreen,
  Keyboard,
  MapPin,
  MessageCircleWarning,
  PersonStanding,
  Radiation,
  Redo,
  RefreshCcwDot,
  Save,
  Scaling,
  SettingsIcon,
  SquareDashedMousePointer,
  TestTube2,
  TextQuote,
  Undo,
  VenetianMask,
  View,
} from "lucide-react";
import { ReactNode } from "react";
import { URI } from "vscode-uri";
import AIWindow from "../../pages/_sub_window/AIWindow";
import SettingsWindow from "../../pages/_sub_window/SettingsWindow";
import { activeProjectAtom, projectsAtom, store } from "../../state";
import { loadAllServices } from "../loadAllServices";
import { Project } from "../Project";
import { TextNode } from "../stage/stageObject/entity/TextNode";

export namespace GlobalMenu {
  export class Menu {
    constructor(
      public name: string,
      public icon: ReactNode = <></>,
      public items: (MenuItem | Separator)[],
    ) {}
  }
  export class MenuItem {
    constructor(
      public name: string,
      public icon: ReactNode = <></>,
      public fn: () => void = () => {},
    ) {}
  }
  export class Separator {}

  export const menus = [
    new Menu("文件", <File />, [
      new MenuItem("新建", <FilePlus />, async () => {
        const project = Project.newDraft();
        loadAllServices(project);
        await project.init();
        store.set(projectsAtom, [...store.get(projectsAtom), project]);
      }),
      new MenuItem("打开", <FolderOpen />, async () => {
        const path = await open({
          directory: false,
          multiple: false,
          filters: [{ name: "工程文件", extensions: ["prg"] }],
        });
        if (!path) return;
        const project = new Project(URI.file(path));
        loadAllServices(project);
        await project.init();
        store.set(projectsAtom, [...store.get(projectsAtom), project]);
      }),
      new Separator(),
      new MenuItem("保存", <Save />, () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        project.save();
      }),
      new MenuItem("另存为", <FileDown />),
      new Separator(),
      new MenuItem("根据文件夹生成嵌套图", <FolderTree />, () => {}),
      new Separator(),
      new MenuItem("导出 SVG矢量图", <FileCode />, () => {}),
      new MenuItem("导出 PNG图片", <FileImage />, () => {}),
      new MenuItem("导出 Markdown格式", <FileType />, () => {}),
      new MenuItem("导出 纯文本格式", <TextQuote />, () => {}),
    ]),
    new Menu("位置", <Folder />, [
      new MenuItem("打开软件配置文件夹", <FolderCog />, () => {}),
      new MenuItem("打开软件缓存文件夹", <FolderClock />, () => {}),
      new MenuItem("打开当前项目文件夹", <FolderOpen />, () => {}),
    ]),
    new Menu("视野", <View />, [
      new MenuItem("根据全部内容重制视野", <Fullscreen />, () => {}),
      new MenuItem("根据选中内容重制视野", <SquareDashedMousePointer />, () => {}),
      new MenuItem("仅重制视野缩放到标准大小", <Scaling />, () => {}),
      new MenuItem("移动视野到坐标轴原点", <MapPin />, () => {}),
    ]),
    new Menu("操作", <Axe />, [
      new MenuItem("刷新", <RefreshCcwDot />, () => {}),
      new MenuItem("撤销", <Undo />, () => {}),
      new MenuItem("重做", <Redo />, () => {}),
      new MenuItem("松开按键", <Keyboard />, () => {}),
      new MenuItem("清空舞台", <Radiation />, () => {}),
    ]),

    new Menu("设置", <SettingsIcon />, [
      new MenuItem("设置", <SettingsIcon />, () => {
        SettingsWindow.open("visual");
      }),
      new MenuItem("test", <TestTube2 />, () => {
        console.log("=========test serialize");
        const project = Project.newDraft();
        const obj = new TextNode(project, {});
        const data = serialize(obj);
        console.log(data);
        const obj2 = deserialize(data, project);
        console.log("=========test deserialize");
        console.log(obj2);
      }),
    ]),
    new Menu("AI", <Bot />, [
      new MenuItem("打开 AI 面板", <ExternalLink />, () => {
        AIWindow.open();
      }),
    ]),
    new Menu("视图", <AppWindow />, [
      new MenuItem("全屏", <Fullscreen />, () => {}),
      new MenuItem("专注模式", <Airplay />, () => {}),
      new MenuItem("隐私模式", <VenetianMask />, () => {}),
    ]),
    new Menu("关于", <CircleAlert />, [
      new MenuItem("关于", <MessageCircleWarning />, () => {
        AIWindow.open();
      }),
      new MenuItem("新手引导", <PersonStanding />, () => {}),
      new MenuItem("进入官网", <Earth />, () => {}),
    ]),
  ];
}
