import { v4 } from "uuid";
import { FolderEntry, readFolderStructure } from "../../../../utils/fs";
import { Camera } from "../../../stage/Camera";
import { LayoutToTightSquareManager } from "../../../stage/stageManager/concreteMethods/layoutManager/layoutToTightSquareManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { Color } from "../../../dataStruct/Color";

export namespace GenerateFromFolderEngine {
  //
  export async function generateFromFolder(folderPath: string): Promise<void> {
    const folderStructure = await readFolderStructure(folderPath);

    // 当前的放置点位
    const currentLocation = Camera.location.clone();

    const dfs = (fEntry: FolderEntry, currentSection: Section | null = null) => {
      if (fEntry.is_file) {
        // 是文件，创建文本节点
        const textNode = new TextNode({
          uuid: v4(),
          text: fEntry.name,
          details: fEntry.path,
          location: currentLocation.toArray(),
          color: getColorByPath(fEntry.path).toArray(),
        });
        StageManager.addTextNode(textNode);
        if (currentSection) {
          StageManager.goInSection([textNode], currentSection);
        }
        return textNode;
      } else {
        // 是文件夹，先创建一个Section
        const section = new Section({
          uuid: v4(),
          text: fEntry.name,
          details: fEntry.path,
          location: currentLocation.toArray(),
        });
        StageManager.addSection(section);
        if (currentSection) {
          StageManager.goInSection([section], currentSection);
        }
        // 然后递归处理子文件夹
        if (fEntry.children) {
          for (const child of fEntry.children) {
            dfs(child, section);
          }
        }
        return section;
      }
    };

    const rootEntity = dfs(folderStructure);
    LayoutToTightSquareManager.layoutToTightSquare([rootEntity]);
  }

  function getColorByPath(path: string): Color {
    if (path.includes(".")) {
      const ext = path.split(".").pop() as string;
      console.log(ext);
      if (ext in fileExtColorMap) {
        return Color.fromHex(fileExtColorMap[ext]);
      } else {
        return Color.Transparent;
      }
    } else {
      return Color.Transparent;
    }
  }

  const fileExtColorMap: Record<string, string> = {
    txt: "#000000",
    md: "#000000",
    html: "#4ec9b0",
    css: "#da70cb",
    js: "#dcdcaa",
    mp4: "#181818",
    mp3: "#ca64ea",
    png: "#7a9a81",
    psd: "#001d26",
    jpg: "#49644e",
    jpeg: "#49644e",
    gif: "#ffca28",
  };
}
