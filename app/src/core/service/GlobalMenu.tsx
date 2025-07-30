import { appCacheDir, dataDir, join } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { open as openFilePath } from "@tauri-apps/plugin-shell";
import {
  Airplay,
  AppWindow,
  Axe,
  Bot,
  CircleAlert,
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
import toast from "react-hot-toast";
import { URI } from "vscode-uri";
import { Dialog } from "@/components/dialog";
import AIWindow from "@/pages/_sub_window/AIWindow";
import SettingsWindow from "@/pages/_sub_window/SettingsWindow";
import { activeProjectAtom, isClassroomModeAtom, projectsAtom, store } from "@/state";
import { loadAllServices } from "@/core/loadAllServices";
import { Project } from "@/core/Project";
import { Settings } from "@/core/service/Settings";

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
      new MenuItem("打开软件配置文件夹", <FolderCog />, async () => {
        const path = await join(await dataDir(), "liren.project-graph");
        openFilePath(path);
      }),
      new MenuItem("打开软件缓存文件夹", <FolderClock />, async () => {
        const path = await appCacheDir();
        openFilePath(path);
      }),
      new MenuItem("打开当前项目文件夹", <FolderOpen />, async () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        if (project.isDraft) {
          await Dialog.show({
            title: "草稿没有位置",
            content: "草稿没有位置，请先保存草稿。",
            type: "warning",
          });
          return;
        }
        const absPath = project.uri.fsPath;
        console.log("正在打开路径", absPath);
        openFilePath(absPath);
      }),
    ]),
    new Menu("视野", <View />, [
      new MenuItem("根据全部内容重制视野", <Fullscreen />, () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        project.camera.reset();
      }),
      new MenuItem("根据选中内容重制视野", <SquareDashedMousePointer />, () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        project.camera.resetBySelected();
      }),
      new MenuItem("仅重制视野缩放到标准大小", <Scaling />, () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        project.camera.resetScale();
      }),
      new MenuItem("移动视野到坐标轴原点", <MapPin />, () => {
        const project = store.get(activeProjectAtom);
        if (!project) return;
        project.camera.resetLocationToZero();
      }),
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
        toast.success("hello world");
      }),
    ]),
    new Menu("AI", <Bot />, [
      new MenuItem("打开 AI 面板", <ExternalLink />, () => {
        AIWindow.open();
      }),
    ]),
    new Menu("视图", <AppWindow />, [
      new MenuItem("全屏", <Fullscreen />, () => {
        getCurrentWindow()
          .isFullscreen()
          .then((res) => getCurrentWindow().setFullscreen(!res));
      }),
      new MenuItem("专注模式", <Airplay />, async () => {
        const isClassroomMode = store.get(isClassroomModeAtom);
        if (!isClassroomMode) {
          Dialog.show({
            title: "恢复方法",
            content: "左上角菜单按钮仅仅是透明了，并没有消失",
          });
        }
        const newValue = !isClassroomMode;
        Settings.set("isClassroomMode", newValue);
        store.set(isClassroomModeAtom, newValue);
      }),
      new MenuItem("隐私模式", <VenetianMask />, async () => {
        await Dialog.show({
          title: "还在开发中",
          content: "还在开发中",
          type: "warning",
        });
      }),
    ]),
    new Menu("关于", <CircleAlert />, [
      new MenuItem("关于", <MessageCircleWarning />, () => {
        SettingsWindow.open("about");
      }),
      new MenuItem("新手引导", <PersonStanding />, () => {
        // 有多标签页了，可以新建一个空的文件并在里面写东西了
      }),
    ]),
  ];
}
