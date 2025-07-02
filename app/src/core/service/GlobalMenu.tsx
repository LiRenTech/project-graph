import { File, FileDown, FilePlus, FolderOpen, Save } from "lucide-react";
import { ReactNode } from "react";

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
    ) {}
  }
  export class Separator {}

  export const menus = [
    new Menu("文件", <File />, [
      new MenuItem("新建", <FilePlus />),
      new MenuItem("打开", <FolderOpen />),
      new Separator(),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
    ]),
    new Menu("编辑", <File />, [
      new MenuItem("新建", <FilePlus />),
      new MenuItem("打开", <FolderOpen />),
      new MenuItem("保存", <Save />),
      new MenuItem("另存为", <FileDown />),
    ]),
  ];
}
