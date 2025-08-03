import { Dialog } from "@/components/ui/dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { loadAllServices } from "@/core/loadAllServices";
import { Project } from "@/core/Project";
import AIWindow from "@/pages/_sub_window/AIWindow";
import SettingsWindow from "@/pages/_sub_window/SettingsWindow";
import { activeProjectAtom, isClassroomModeAtom, projectsAtom, store } from "@/state";
import { appCacheDir, dataDir, join } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { open as openFilePath } from "@tauri-apps/plugin-shell";
import { useAtom } from "jotai";
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
  FileInput,
  FileOutput,
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
  TextQuote,
  Undo,
  View,
} from "lucide-react";
import { toast } from "sonner";
import { URI } from "vscode-uri";
import { Telemetry } from "./Telemetry";

export function GlobalMenu() {
  // const [projects, setProjects] = useAtom(projectsAtom);
  const [activeProject] = useAtom(activeProjectAtom);
  const [isClassroomMode, setIsClassroomMode] = useAtom(isClassroomModeAtom);

  return (
    <Menubar>
      {/* 文件 */}
      <MenubarMenu>
        <MenubarTrigger>
          <File />
          文件
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNewDraft}>
            <FilePlus />
            新建
          </MenubarItem>
          <MenubarItem onClick={onOpenFile}>
            <FolderOpen />
            打开
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            onClick={() => {
              activeProject?.save();
            }}
          >
            <Save />
            保存
          </MenubarItem>
          <MenubarItem>
            <FileDown />
            另存为
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <FileInput />
              导入
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>
                <FolderTree />
                根据文件夹生成嵌套图
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>
              <FileOutput />
              导出
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>
                <FileCode />
                SVG矢量图
              </MenubarItem>
              <MenubarItem>
                <FileImage />
                PNG图片
              </MenubarItem>
              <MenubarItem>
                <FileType />
                Markdown格式
              </MenubarItem>
              <MenubarItem>
                <TextQuote />
                纯文本格式
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>

      {/* 位置 */}
      <MenubarMenu>
        <MenubarTrigger>
          <Folder />
          位置
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={async () => {
              const path = await join(await dataDir(), "liren.project-graph");
              openFilePath(path);
            }}
          >
            <FolderCog />
            打开软件配置文件夹
          </MenubarItem>
          <MenubarItem
            onClick={async () => {
              const path = await appCacheDir();
              openFilePath(path);
            }}
          >
            <FolderClock />
            打开软件缓存文件夹
          </MenubarItem>
          <MenubarItem
            disabled={!activeProject || activeProject.isDraft}
            onClick={async () => {
              const absPath = activeProject!.uri.fsPath;
              openFilePath(absPath);
            }}
          >
            <FolderOpen />
            打开当前项目文件夹
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 视野 */}
      <MenubarMenu>
        <MenubarTrigger disabled={!activeProject}>
          <View />
          视野
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => {
              activeProject?.camera.reset();
            }}
          >
            <Fullscreen />
            根据全部内容重制视野
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              activeProject?.camera.resetBySelected();
            }}
          >
            <SquareDashedMousePointer />
            根据选中内容重制视野
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              activeProject?.camera.resetScale();
            }}
          >
            <Scaling />
            仅重制视野缩放到标准大小
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              activeProject?.camera.resetLocationToZero();
            }}
          >
            <MapPin />
            移动视野到坐标轴原点
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 操作 */}
      <MenubarMenu>
        <MenubarTrigger disabled={!activeProject}>
          <Axe />
          操作
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <RefreshCcwDot />
            刷新
          </MenubarItem>
          <MenubarItem>
            <Undo />
            撤销
          </MenubarItem>
          <MenubarItem>
            <Redo />
            重做
          </MenubarItem>
          <MenubarItem
            onClick={() => {
              activeProject?.controller.pressingKeySet.clear();
            }}
          >
            <Keyboard />
            松开按键
          </MenubarItem>
          <MenubarItem
            onClick={async () => {
              if (await Dialog.confirm("确认清空舞台？", "此操作无法撤销！", { destructive: true })) {
                activeProject!.stage = [];
              }
            }}
          >
            <Radiation />
            清空舞台
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 设置 */}
      <MenubarMenu>
        <MenubarTrigger>
          <SettingsIcon />
          设置
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => SettingsWindow.open("visual")}>
            <SettingsIcon />
            设置
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* AI */}
      <MenubarMenu>
        <MenubarTrigger disabled={!activeProject}>
          <Bot />
          AI
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => AIWindow.open()}>
            <ExternalLink />
            打开 AI 面板
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* 视图 */}
      <MenubarMenu>
        <MenubarTrigger>
          <AppWindow />
          视图
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() =>
              getCurrentWindow()
                .isFullscreen()
                .then((res) => getCurrentWindow().setFullscreen(!res))
            }
          >
            <Fullscreen />
            全屏
          </MenubarItem>
          <MenubarItem
            onClick={async () => {
              if (!isClassroomMode) {
                toast.info("左上角菜单按钮仅仅是透明了，并没有消失");
              }
              const newValue = !isClassroomMode;
              setIsClassroomMode(newValue);
            }}
          >
            <Airplay />
            专注模式
          </MenubarItem>
          {/* TODO: 隐私模式 */}
          {/* <MenubarItem>
            <VenetianMask />
            隐私模式
          </MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>

      {/* 关于 */}
      <MenubarMenu>
        <MenubarTrigger>
          <CircleAlert />
          关于
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => SettingsWindow.open("about")}>
            <MessageCircleWarning />
            关于
          </MenubarItem>
          <MenubarItem>
            <PersonStanding />
            新手引导
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export async function onNewDraft() {
  const project = Project.newDraft();
  loadAllServices(project);
  await project.init();
  store.set(projectsAtom, [...store.get(projectsAtom), project]);
  store.set(activeProjectAtom, project);
}
export async function onOpenFile() {
  const path = await open({
    directory: false,
    multiple: false,
    filters: [{ name: "工程文件", extensions: ["prg"] }],
  });
  if (!path) return;
  const project = new Project(URI.file(path));
  const t = performance.now();
  loadAllServices(project);
  const loadServiceTime = performance.now() - t;
  await project.init();
  const readFileTime = performance.now() - t;
  store.set(projectsAtom, [...store.get(projectsAtom), project]);
  store.set(activeProjectAtom, project);
  Telemetry.event("打开文件", {
    loadServiceTime,
    readFileTime,
  });
}
