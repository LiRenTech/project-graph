import { useEffect, useState } from "react";

// 常规阶段提示文字
const normalStage = [
  "框选物体：鼠标左键框选",
  "创建节点：鼠标左键双击",
  "创建连线：右键拖拽物体",
  "缩放视野：滚轮或中括号键",
  "移动视野：WSAD，鼠标中键拖动，按住空格+左键拖动",
];

// 按下左键提示文字
const whenPressLeftMouse = [
  "移动节点：左键拖拽或",
  "整体移动节点：拖拽同时按下Ctrl",
  "旋转子树：悬浮节点后ctrl+鼠标滚轮",
  "旋转连线：左键拖拽线",
  "编辑节点：双击节点",
  "编辑节点详情：Ctrl+双击节点",
  "编辑连线：双击连线",
];

const whenPressRightMouse = [
  "删除连线：右键空白地方划线切断连线",
  "添加连线：右键拖拽物体",
  "删除物体：右键空白地方划线或框选Delete",
];

/**
 * 底部提示文字
 */
export default function HintText() {
  // 这里暂时是切分成不同状态下显示多个提示。后续可以根据实际情况调整

  const [hintTextList, setHintTextList] = useState(normalStage);
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setHintTextList(whenPressLeftMouse);
      } else if (e.button === 2) {
        setHintTextList(whenPressRightMouse);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseUp = (_: MouseEvent) => {
      setHintTextList(normalStage);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });
  // littlefean：放下面是真有人看不到啊，一开始窗口可能靠下，被挡住了
  return (
    <>
      <div className="pointer-events-none fixed left-0 top-16 flex w-full flex-row items-center justify-start p-1">
        {hintTextList.map((text, index) => (
          <div
            key={index}
            style={{ color: "#7f7278", borderColor: "#7f7278" }}
            className="mr-1 flex h-full items-center border-r-2 pr-1 text-xs"
          >
            {text}
          </div>
        ))}
      </div>
    </>
  );
}
