import { Dialog } from "@/components/dialog";
import { Dialog as DialogNew } from "@/components/ui/dialog";
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
import { Settings } from "@/core/service/Settings";
import AIWindow from "@/pages/_sub_window/AIWindow";
import SettingsWindow from "@/pages/_sub_window/SettingsWindow";
import { activeProjectAtom, isClassroomModeAtom, projectsAtom, store } from "@/state";
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
  TestTube2,
  TextQuote,
  Undo,
  VenetianMask,
  View,
} from "lucide-react";
import { toast } from "sonner";
import { URI } from "vscode-uri";
import { Telemetry } from "./Telemetry";

export const GlobalMenu = () => (
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
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.save();
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
        <MenubarItem>
          <FolderTree />
          根据文件夹生成嵌套图
        </MenubarItem>
        <MenubarSeparator />
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
          onClick={async () => {
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
          }}
        >
          <FolderOpen />
          打开当前项目文件夹
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    {/* 视野 */}
    <MenubarMenu>
      <MenubarTrigger>
        <View />
        视野
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem
          onClick={() => {
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.camera.reset();
          }}
        >
          <Fullscreen />
          根据全部内容重制视野
        </MenubarItem>
        <MenubarItem
          onClick={() => {
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.camera.resetBySelected();
          }}
        >
          <SquareDashedMousePointer />
          根据选中内容重制视野
        </MenubarItem>
        <MenubarItem
          onClick={() => {
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.camera.resetScale();
          }}
        >
          <Scaling />
          仅重制视野缩放到标准大小
        </MenubarItem>
        <MenubarItem
          onClick={() => {
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.camera.resetLocationToZero();
          }}
        >
          <MapPin />
          移动视野到坐标轴原点
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    {/* 操作 */}
    <MenubarMenu>
      <MenubarTrigger>
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
            const project = store.get(activeProjectAtom);
            if (!project) return;
            project.controller.pressingKeySet.clear();
          }}
        >
          <Keyboard />
          松开按键
        </MenubarItem>
        <MenubarItem
          onClick={() => {
            const project = store.get(activeProjectAtom);
            if (!project) return;
            Dialog.show({
              title: "确认清空舞台",
              content: "确认清空舞台？",
              type: "warning",
              buttons: [
                {
                  text: "确定",
                  color: "green",
                  onClick: () => (project.stage = []),
                },
                { text: "取消", color: "red", onClick: () => {} },
              ],
            });
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
        <MenubarItem
          onClick={async () => {
            toast((await DialogNew.confirm("are you sure?", "114514")) ? "true" : "false");
            toast(await DialogNew.input("请输入文本..", "123", { defaultValue: "456", placeholder: "..." }));
            toast(await DialogNew.input("你有意见？", "aaa", { placeholder: "...", multiline: true }));
            toast(
              await DialogNew.buttons("1", "2", [
                { id: "cancel", label: "取消", variant: "outline" },
                { id: "discard", label: "不保存", variant: "destructive" },
                { id: "save", label: "保存" },
              ]),
            );
          }}
        >
          <TestTube2 />
          test
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    {/* AI */}
    <MenubarMenu>
      <MenubarTrigger>
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
          }}
        >
          <Airplay />
          专注模式
        </MenubarItem>
        <MenubarItem
          onClick={async () => {
            await Dialog.show({
              title: "还在开发中",
              content: "还在开发中",
              type: "warning",
            });
          }}
        >
          <VenetianMask />
          隐私模式
        </MenubarItem>
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
