import { StageManager } from "../StageManager";

export namespace StageNodeTextTransfer {
  export function calculateAllSelected() {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        try {
          const res = eval(node.text);
          setTimeout(() => {
            node.rename(res.toString());
          }, 1000);
        } catch (e) {
          node.rename("Error");
        }
      }
    }
  }
}
