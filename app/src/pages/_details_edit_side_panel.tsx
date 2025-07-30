import React from "react";
import { editTextNodeHookGlobal } from "@/core/service/controlService/controller/concrete/utilsControl";
import { Controller } from "@/core/service/controlService/controller/Controller";
import { Entity } from "@/core/stage/stageObject/abstract/StageEntity";
// import "vditor/src/assets/scss/index.scss";
import { driver } from "driver.js";
import { Tourials } from "@/core/service/Tourials";
import MarkdownEditor from "@/pages/_vditor_panel";
import { StageManager } from "@/core/stage/stageManager/StageManager";

export default function DetailsEditSidePanel() {
  const [inputCurrentDetails, setInputCurrentDetails] = React.useState("");
  /**
   * 是否处于节点详情编辑状态
   * 用于控制是否显示编辑器
   */
  const [isShowPanel, setShowPanel] = React.useState(false);

  const [clickedNode, setClickedNode] = React.useState<Entity | null>(null);

  const setInputCurrentDetailsHandler = (value?: string | undefined) => {
    if (value !== undefined) {
      setInputCurrentDetails(value);
    }
  };

  /**
   * 按下快捷键，展开面板后会触发此函数
   * @param entity
   */
  editTextNodeHookGlobal.hookFunctionStart = (entity: Entity) => {
    if (isShowPanel) {
      // 发生切换
      StageManager.getEntities().forEach((entity) => {
        entity.isEditingDetails = false;
      });
      entity.isEditingDetails = true;
    }
    setInputCurrentDetails(entity.details);
    setClickedNode(entity);
    setShowPanel(true);
    // 清空Stage上所有按下的键的状态
    Controller.pressingKeySet.clear();
    // 显示教程
    setTimeout(() => {
      Tourials.tour("nodeDetailsEditor", () => {
        driver({
          steps: [
            {
              element: "#details-editor",
              popover: {
                title: "节点详情编辑",
                description:
                  "你可以在右侧编辑节点详情，支持 Markdown 语法。节点详情会部分显示在节点的下方，显示范围可以在 设置>显示 中自由调整",
              },
            },
            {
              element: "#details-editor .vditor-toolbar__item:nth-child(1)",
              popover: {
                title: "确认编辑",
                description: "编辑完成后点击此按钮确认修改。也可以使用对应的快捷键关闭编辑器。",
              },
            },
            {
              element: "#details-editor .vditor-toolbar__item:nth-child(2)",
              popover: {
                title: "全屏编辑",
                description: "点击此按钮进入全屏模式。",
              },
            },
          ],
        }).drive();
      });
    }, 500);
  };
  editTextNodeHookGlobal.hookFunctionEnd = (entity: Entity) => {
    entity.changeDetails(inputCurrentDetails);
    Controller.isCameraLocked = false;
    entity.isEditingDetails = false;
    // 选中这个节点
    entity.isSelected = true;
  };

  return (
    <>
      {isShowPanel && (
        <MarkdownEditor
          id="details-editor"
          className="fixed bottom-4 right-4 top-20 z-50 overflow-hidden rounded-xl"
          onChange={setInputCurrentDetailsHandler}
          defaultValue={inputCurrentDetails}
          options={{
            width: "50%",
            ctrlEnter: (currentInput: string) => {
              setShowPanel(false);
              if (clickedNode) {
                clickedNode.details = currentInput;
                clickedNode.isEditingDetails = false;
                clickedNode.isSelected = true;
              } else {
                throw new Error("没有点击节点");
              }
            },
            esc: (currentInput: string) => {
              setShowPanel(false);
              if (clickedNode) {
                clickedNode.details = currentInput;
                clickedNode.isEditingDetails = false;
                // clickedNode.isSelected = true;
                // esc键就不再选中节点了，因为它和一键取消所有选中的操作冲突了，所以选中也会被取消
              } else {
                throw new Error("没有点击节点");
              }
            },
            blur: (currentInput: string) => {
              if (clickedNode) {
                clickedNode.details = currentInput;
              }
            },
            toolbar: [
              {
                name: "confirm",
                tip: "确认，（Esc 或 Ctrl + Enter）",
                tipPosition: "se",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024"><path fill="currentColor" d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5L207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8"/></svg>',
                click: () => {
                  setShowPanel(false);
                  StageManager.getEntities().forEach((entity) => {
                    entity.isEditingDetails = false;
                  });
                },
              },
              { name: "fullscreen", tipPosition: "s" },
              { name: "list", tipPosition: "s" },
              { name: "ordered-list", tipPosition: "s" },
              { name: "check", tipPosition: "s" },
              { name: "outdent", tipPosition: "s" },
              { name: "indent", tipPosition: "s" },
              { name: "|" },
              { name: "code", tipPosition: "s" },
              { name: "inline-code", tipPosition: "sw" },
              { name: "|" },
            ],
          }}
        />
      )}
    </>
  );
}
