import { StageManager } from "../core/stage/stageManager/StageManager";
import { open } from "@tauri-apps/plugin-shell";

/**
 * 工具栏中的地球仪图标
 */
export async function openBrowserOrFile() {
  for (const node of StageManager.getTextNodes()) {
    if (node.isSelected) {
      let nodeText = node.text;
      if (node.text.startsWith('"') && node.text.endsWith('"')) {
        // 去除前后的引号
        nodeText = nodeText.slice(1, -1);
      }
      myOpen(nodeText);
      // 2025年1月4日——有自动备份功能了，好像不需要再加验证了

      // if (PathString.isValidURL(nodeText)) {
      //   // 是网址
      //   myOpen(nodeText);
      // } else {
      //   const isExists = await exists(nodeText);
      //   if (isExists) {
      //     // 是文件
      //     myOpen(nodeText);
      //   } else {
      //     // 不是网址也不是文件，不做处理
      //     Stage.effectMachine.addEffect(new TextRiseEffect("非法文件路径: " + nodeText));
      //   }
      // }
    }
  }
}

function myOpen(url: string) {
  open(url)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((_) => {})
    .catch((e) => {
      // 依然会导致程序崩溃，具体原因未知
      // 2025年2月17日，好像不会再崩溃了，只是可能会弹窗说找不到文件
      console.error(e);
    });
}
