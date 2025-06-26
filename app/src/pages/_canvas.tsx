import { useAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import { Dialog } from "../components/dialog";
import { Renderer } from "../core/render/canvas2d/renderer";
import { Controller } from "../core/service/controlService/controller/Controller";
import { StageStyleManager } from "../core/service/feedbackService/stageStyle/StageStyleManager";
import { Stage } from "../core/stage/Stage";
import { isClassroomModeAtom, isWindowCollapsingAtom } from "../state";
import { CursorNameEnum } from "../types/cursors";
import { DateChecker } from "../utils/dateChecker";
import { isFrame } from "../utils/platform";
import DetailsEditSidePanel from "./_details_edit_side_panel";
import DetailsEditSmallPanel from "./_details_edit_small_panel";
import HintText from "./_hint_text";
import FoolsDayButton from "./_special_day_dialog/fools_day";
import Toolbar from "./_toolbar";

/**
 * 画布，显示所有舞台上的内容
 */
export default function PGCanvas() {
  const canvasRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);

  const [cursorName, setCursorName] = React.useState(CursorNameEnum.Default);

  // 背景透明度，实测发现不能用 Settings.use，会导致无法根据快捷键实时更新，必须要切换页面才能更新背景透明度
  const [bgAlpha, setBgAlpha] = React.useState(0.9);

  const [uiShow, setUIShow] = React.useState(true);
  const [nodeDetailsPanel] = Settings.use("nodeDetailsPanel");
  const [isProtectPrivacy] = Settings.use("protectingPrivacy");
  const [compatibilityMode, setCompatibilityMode] = React.useState(false);

  const [isWindowCollapsing] = useAtom(isWindowCollapsingAtom);
  const [isClassroomMode] = useAtom(isClassroomModeAtom);

  useEffect(() => {
    Settings.watch("windowBackgroundAlpha", (value) => {
      setBgAlpha(value);
    });
    Settings.watch("showTipsOnUI", (value) => {
      setUIShow(value);
    });

    const handleResize = () => {
      if (canvasElement) {
        Renderer.resizeWindow(window.innerWidth, window.innerHeight);
      }
    };

    /**
     * 经过测试
     * 按住窗口角落开始拖拽改变大小的时候，按下的那一刹那触发一个blur，然后再立刻触发一个focus。
     * 按住顶部拖拽移动窗口位置时，按下的那一刹那同上
     * F11和最大化状态切换不触发
     * 最小化会触发blur
     */
    // 窗口切回来，显示到屏幕上时触发
    const handleFocus = () => {
      Stage.isWindowFocused = true;
      // console.log("focus");
      // 解决alt+tab切换窗口后还在监听alt按下的问题
      Controller.pressingKeySet.clear();
    };

    // alt+tab切换窗口或者最小化时触发
    const handleBlur = () => {
      if (isFrame) return;
      Stage.isWindowFocused = false;
      // console.log("blur");
      // 解决alt+tab切换窗口后还在监听alt按下的问题
      Controller.pressingKeySet.clear();
    };

    const canvasElement = canvasRef.current;

    if (canvasElement) {
      this.project.canvas.init(canvasElement);
      Renderer.resizeWindow(window.innerWidth, window.innerHeight);
      Controller.init();
      Controller.setCursorNameHook = (name: CursorNameEnum) => {
        // 这里只有在中键拖动的时候才可能频繁调用，似乎不太影响性能
        setCursorName(name);
      };
    } else {
      Dialog.show({
        title: "错误",
        type: "error",
        content: "canvas元素不存在",
      });
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    Settings.watch("compatibilityMode", (value) => {
      setCompatibilityMode(value);
      console.log(value, "compatibilityMode");
      destroyTick(value);
      startTick(value);
    });

    const tick = () => {
      if (!Stage.isWindowFocused) {
        return;
      }

      // 决定是否渲染画面
      if (Renderer.isPauseRenderWhenManipulateOvertime) {
        if (!Controller.isManipulateOverTime()) {
          Renderer.frameTick();
        }
      } else {
        Renderer.frameTick();
      }

      Stage.logicTick();
      // i++;
    };

    let frameId = -1;
    let loopInterval: NodeJS.Timeout;

    // 开启定时器
    const startTick = (isCompatibilityMode: boolean) => {
      if (isCompatibilityMode) {
        // setInterval 模式

        loopInterval = setInterval(() => {
          tick();
          // console.log("interval tick");
        }, 1000 / 60);
        console.log("开启interval模式", loopInterval, typeof loopInterval);
      } else {
        // requestAnimationFrame 模式

        const loop = () => {
          frameId = requestAnimationFrame(loop);
          tick();
          // console.log("requestAnimationFrame tick");
        };
        frameId = requestAnimationFrame(loop);
        console.log("开启requestAnimationFrame模式", frameId, typeof frameId);
      }
    };

    // BUG: 似乎不能准确的关闭当前正在运行的定时器，造成多开，帧数虚高卡顿
    const destroyTick = (isCompatibilityMode: boolean) => {
      if (isCompatibilityMode) {
        clearInterval(loopInterval);
      } else {
        cancelAnimationFrame(frameId);
      }
    };

    // 清理事件监听器
    return () => {
      // console.log("PGCanvas unmount"); // 目前似乎不会触发了
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      Controller.destroy();
      destroyTick(compatibilityMode);
    };
  }, []);

  return (
    <>
      {!isWindowCollapsing && !isClassroomMode && !isFrame && <Toolbar />}
      {/* 这个打算被取代 */}
      {nodeDetailsPanel === "small" ? <DetailsEditSmallPanel /> : <DetailsEditSidePanel />}
      {!isWindowCollapsing && !isClassroomMode && !isFrame && uiShow && <HintText />}
      {/* TODO: 下面这个写法有点奇怪 rgba值太长了 */}
      <div
        style={{
          background: `rgba(${StageStyleManager.currentStyle.Background.r},${StageStyleManager.currentStyle.Background.g},${StageStyleManager.currentStyle.Background.b},${isProtectPrivacy ? 1 : bgAlpha})`,
        }}
      >
        <canvas ref={canvasRef} className={cursorName} />
      </div>

      {/* 愚人节小组件 */}
      {!isWindowCollapsing && !isClassroomMode && !isFrame && DateChecker.isCurrentEqualDate(4, 1) && (
        <FoolsDayButton />
      )}
    </>
  );
}
