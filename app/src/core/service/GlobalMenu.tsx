import { File, FileDown, FilePlus, FolderOpen, Save } from "lucide-react";
import { ReactNode } from "react";
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
      new MenuItem("打开", <FolderOpen />),
      new Separator(),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
    ]),
    new Menu("编辑", <File />, []),
  ];
}
