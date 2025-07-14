import { deserialize, serialize } from "@graphif/serializer";
import { open } from "@tauri-apps/plugin-dialog";
import { Bot, ExternalLink, File, FileDown, FilePlus, FolderOpen, Save, SettingsIcon, TestTube2 } from "lucide-react";
import { ReactNode } from "react";
import { URI } from "vscode-uri";
import { Dialog } from "../../components/dialog";
import AIWindow from "../../pages/_sub_window/AIWindow";
import SettingsWindow from "../../pages/_sub_window/SettingsWindow";
import { projectsAtom, store } from "../../state";
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
      new MenuItem("新建", <FilePlus />, () => {
        const project = Project.newDraft();
        loadAllServices(project);
        store.set(projectsAtom, [...store.get(projectsAtom), project]);
      }),
      new MenuItem("打开", <FolderOpen />, async () => {
        const path = await open({
          directory: false,
          multiple: false,
          filters: [{ name: "工程文件", extensions: ["prg", "json"] }],
        });
        if (!path) return;
        if (path.endsWith(".json")) {
          const answer = await Dialog.show({
            title: "转换文件格式",
            content: "从 2.0 版本开始，工程文件将使用 PRG 格式存储。是否要转换？",
            buttons: [
              {
                text: "取消打开",
              },
              {
                text: "转换并打开",
              },
            ],
          });
          if (answer.button === "取消打开") return;
        }
        const project = new Project(URI.file(path));
        loadAllServices(project);
        store.set(projectsAtom, [...store.get(projectsAtom), project]);
      }),
      new Separator(),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
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
  ];
}
