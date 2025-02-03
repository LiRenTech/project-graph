import React from "react";
import { editTextNodeHookGlobal } from "../core/service/controlService/controller/concrete/utilsControl";
import { Controller } from "../core/service/controlService/controller/Controller";
import { Entity } from "../core/stage/stageObject/abstract/StageEntity";
// import "vditor/src/assets/scss/index.scss";
import { driver } from "driver.js";
import { Tourials } from "../core/service/Tourials";
import MarkdownEditor from "./_vditor_panel";

export default function DetailsEditSidePanel() {
  const [inputCurrentDetails, setInputCurrentDetails] = React.useState("");
  const [isNodeTextEditing, setIsNodeTextEditing] = React.useState(false);
  const [clickedNode, setClickedNode] = React.useState<Entity>();
  const setInputCurrentDetailsHandler = (value?: string | undefined) => {
    if (value !== undefined) {
      setInputCurrentDetails(value);
    }
  };
  const handleConfirmDetailsEdit = () => {
    setIsNodeTextEditing(false);
    if (clickedNode) {
      editTextNodeHookGlobal.hookFunctionEnd(clickedNode);
    } else {
      console.warn("没有点击节点");
    }
  };
  editTextNodeHookGlobal.hookFunctionStart = (entity: Entity) => {
    setInputCurrentDetails(entity.details);
    setClickedNode(entity);
    setIsNodeTextEditing(true);
    setTimeout(() => {
      Tourials.tour("nodeDetailsEditor", () => {
        driver({
          steps: [
            {
              element: "#details-editor",
              popover: {
                title: "节点详情编辑",
                description: "节点详情会显示在节点的下方，你可以在右侧编辑，支持 Markdown 语法。",
              },
            },
            {
              element: "#details-editor .vditor-toolbar__item:nth-child(1)",
              popover: {
                title: "确认编辑",
                description: "编辑完成后点击此按钮确认修改。",
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
  };

  return (
    <>
      {isNodeTextEditing && (
        <MarkdownEditor
          id="details-editor"
          className="fixed bottom-4 right-4 top-20 z-50 overflow-hidden rounded-xl"
          onChange={setInputCurrentDetailsHandler}
          defaultValue={inputCurrentDetails}
          options={{
            width: "50%",
            toolbar: [
              {
                name: "confirm",
                tip: "确认",
                tipPosition: "n",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024"><path fill="currentColor" d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5L207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8"/></svg>',
                click: handleConfirmDetailsEdit,
              },
              "fullscreen",
              "|",
              "headings",
              "bold",
              "italic",
              "strike",
              "link",
              "|",
              "list",
              "ordered-list",
              "check",
              "outdent",
              "indent",
              "|",
              "quote",
              "line",
              "code",
              "inline-code",
              "table",
              "|",
              "undo",
              "redo",
            ],
          }}
        />
      )}
    </>
  );
}
