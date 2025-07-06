import { open } from "@tauri-apps/plugin-dialog";
import { File, FileDown, FilePlus, FolderOpen, Save } from "lucide-react";
import { ReactNode } from "react";
import { URI } from "vscode-uri";
import { Dialog } from "../../components/dialog";
import { projectsAtom, store } from "../../state";
import { Project } from "../Project";
import { loadAllServices } from "../loadAllServices";

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
    new Menu("编辑", <File />, []),
  ];
}
