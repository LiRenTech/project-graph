import { getEnterKey } from "../../../../utils/keyboardFunctions";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { EntityDashTipEffect } from "../../feedbackService/effectEngine/concrete/EntityDashTipEffect";
import { EntityShakeEffect } from "../../feedbackService/effectEngine/concrete/EntityShakeEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { Settings } from "../../Settings";
import { editTextNode } from "../controller/concrete/utilsControl";
import { KeyboardOnlyGraphEngine } from "./keyboardOnlyGraphEngine";
import { SelectChangeEngine } from "./selectChangeEngine";

/**
 * 纯键盘控制的相关引擎
 */
export namespace KeyboardOnlyEngine {
  let textNodeStartEditMode: Settings.Settings["textNodeStartEditMode"] = "enter";
  let textNodeSelectAllWhenStartEditByKeyboard: boolean = true;

  export function init() {
    bindKeyEvents();
    KeyboardOnlyGraphEngine.init();
    Settings.watch("textNodeStartEditMode", (value) => {
      textNodeStartEditMode = value;
    });
    Settings.watch("textNodeSelectAllWhenStartEditByKeyboard", (value) => {
      textNodeSelectAllWhenStartEditByKeyboard = value;
    });
  }

  export function logicTick() {
    KeyboardOnlyGraphEngine.logicTick();
  }

  /**
   * 开始绑定按键事件
   * 仅在最开始调用一次
   */
  function bindKeyEvents() {
    const startEditNode = (event: KeyboardEvent, selectedNode: TextNode) => {
      event.preventDefault(); // 这个prevent必须开启，否则会立刻在刚创建的输入框里输入一个换行符。
      addSuccessEffect();
      // 编辑节点
      editTextNode(selectedNode, textNodeSelectAllWhenStartEditByKeyboard);
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const enterKeyDetail = getEnterKey(event);
        if (textNodeStartEditMode === enterKeyDetail) {
          // 这个还必须在down的位置上，因为在up上会导致无限触发
          const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        } else {
          // 用户可能记错了快捷键
          addFailEffect();
        }
      } else if (event.key === " ") {
        if (textNodeStartEditMode === "space") {
          const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
          if (!selectedNode) return;
          startEditNode(event, selectedNode);
        }
      } else if (event.key === "Escape") {
        // 取消全部选择
        for (const stageObject of StageManager.getStageObject()) {
          stageObject.isSelected = false;
        }
      } else if (event.key === "F2") {
        const selectedNode = StageManager.getTextNodes().find((node) => node.isSelected);
        if (!selectedNode) return;
        // 编辑节点
        editTextNode(selectedNode);
      } else {
        SelectChangeEngine.listenKeyDown(event);
      }
    });
  }

  function addSuccessEffect() {
    const textNodes = StageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      Stage.effectMachine.addEffect(new EntityDashTipEffect(50, textNode.collisionBox.getRectangle()));
    }
  }

  function addFailEffect() {
    const textNodes = StageManager.getTextNodes().filter((textNode) => textNode.isSelected);
    for (const textNode of textNodes) {
      Stage.effectMachine.addEffect(EntityShakeEffect.fromEntity(textNode));
    }
    Stage.effectMachine.addEffect(TextRiseEffect.default("您可能记错了节点进入编辑状态的控制键设置"));
  }
}
