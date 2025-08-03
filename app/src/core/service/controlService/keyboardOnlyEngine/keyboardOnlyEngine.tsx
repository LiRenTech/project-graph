import { Project, service } from "@/core/Project";
import { EntityDashTipEffect } from "@/core/service/feedbackService/effectEngine/concrete/EntityDashTipEffect";
import { EntityShakeEffect } from "@/core/service/feedbackService/effectEngine/concrete/EntityShakeEffect";
import { Settings } from "@/core/service/Settings";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { getEnterKey } from "@/utils/keyboardFunctions";
import { toast } from "sonner";

/**
 * 纯键盘控制的相关引擎
 */
@service("keyboardOnlyEngine")
export class KeyboardOnlyEngine {
  private textNodeStartEditMode: Settings.Settings["textNodeStartEditMode"] = "enter";
  private textNodeSelectAllWhenStartEditByKeyboard: boolean = true;
  autoLayoutWhenTreeGenerate: Settings.Settings["autoLayoutWhenTreeGenerate"] = true;

  constructor(private readonly project: Project) {
    this.bindKeyEvents();
    Settings.watch("textNodeStartEditMode", (value) => {
      this.textNodeStartEditMode = value;
    });
    Settings.watch("textNodeSelectAllWhenStartEditByKeyboard", (value) => {
      this.textNodeSelectAllWhenStartEditByKeyboard = value;
    });
    Settings.watch("autoLayoutWhenTreeGenerate", (value) => {
      this.autoLayoutWhenTreeGenerate = value;
    });
  }

  /**
   * 只有在某些面板打开的时候，这个引擎才会禁用，防止误触
   */
  private openning = true;
  setOpenning(value: boolean) {
    this.openning = value;
  }
  isOpenning() {
    return this.openning;
  }

  /**
   * 开始绑定按键事件
   * 仅在最开始调用一次
   */
  private bindKeyEvents() {
    const startEditNode = (event: KeyboardEvent, selectedNode: TextNode) => {
      event.preventDefault(); // 这个prevent必须开启，否则会立刻在刚创建的输入框里输入一个换行符。
      this.addSuccessEffect();
      // 编辑节点
      this.project.controllerUtils.editTextNode(selectedNode, this.textNodeSelectAllWhenStartEditByKeyboard);
    };

    window.addEventListener("keydown", (event) => {
      // 防止在编辑节点时，按下其他按键导致编辑失败
      if (!this.openning) return;

      if (event.key === "Enter") {
        const enterKeyDetail = getEnterKey(event);
        if (this.textNodeStartEditMode === enterKeyDetail) {
          // 这个还必须在down的位置上，因为在up上会导致无限触发
          const selectedNode = this.project.stageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        } else {
          // 用户可能记错了快捷键
          this.addFailEffect();
        }
      } else if (event.key === " ") {
        if (this.textNodeStartEditMode === "space") {
          const selectedNode = this.project.stageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        }
      } else if (event.key === "Escape") {
        // 取消全部选择
        for (const stageObject of this.project.stageManager.getStageObjects()) {
          stageObject.isSelected = false;
        }
      } else if (event.key === "F2") {
        const selectedNode = this.project.stageManager.getTextNodes().find((node) => node.isSelected);
        if (!selectedNode) return;
        // 编辑节点
        this.project.controllerUtils.editTextNode(selectedNode);
      } else {
        // SelectChangeEngine.listenKeyDown(event);
      }
    });
  }

  private addSuccessEffect() {
    const textNodes = this.project.stageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      this.project.effects.addEffect(new EntityDashTipEffect(50, textNode.collisionBox.getRectangle()));
    }
  }

  private addFailEffect() {
    const textNodes = this.project.stageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      this.project.effects.addEffect(EntityShakeEffect.fromEntity(textNode));
    }
    toast("您可能记错了节点进入编辑状态的控制键设置");
  }
}
