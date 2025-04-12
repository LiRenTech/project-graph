import { useAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import { Dialog } from "../components/dialog";
import { Renderer } from "../core/render/canvas2d/renderer";
import { Controller } from "../core/service/controlService/controller/Controller";
import { StageStyleManager } from "../core/service/feedbackService/stageStyle/StageStyleManager";
import { Settings } from "../core/service/Settings";
import { Canvas } from "../core/stage/Canvas";
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

  const [uiShow] = Settings.use("showTipsOnUI");
  const [nodeDetailsPanel] = Settings.use("nodeDetailsPanel");
  const [isProtectPrivacy] = Settings.use("protectingPrivacy");
  const [compatibilityMode] = Settings.use("compatibilityMode");

  const [isWindowCollapsing] = useAtom(isWindowCollapsingAtom);
  const [isClassroomMode] = useAtom(isClassroomModeAtom);

  useEffect(() => {
    Settings.watch("windowBackgroundAlpha", (value) => {
      setBgAlpha(value);
    });
    const handleResize = () => {
      if (canvasElement) {
        Renderer.resizeWindow(window.innerWidth, window.innerHeight);
      }
    };
    const handleFocus = () => {
      focus = true;
      // 解决alt+tab切换窗口后还在监听alt按下的问题
      Controller.pressingKeySet.clear();
    };
    const handleBlur = () => {
      if (isFrame) return;
      focus = false;
      // 解决alt+tab切换窗口后还在监听alt按下的问题
      Controller.pressingKeySet.clear();
    };

    const canvasElement = canvasRef.current;
    let focus = true;

    if (canvasElement) {
      Canvas.init(canvasElement);
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

    const tick = () => {
      if (!focus) {
        return;
      }
      // 计算FPS
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      Renderer.deltaTime = deltaTime;

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

    // 开启定时器
    let lastTime = performance.now();
    let frameId = -1;
    if (compatibilityMode) {
      setInterval(() => {
        tick();
      }, 1000 / 60);
    } else {
      const loop = () => {
        frameId = requestAnimationFrame(loop);
        tick();
      };
      frameId = requestAnimationFrame(loop);
    }

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      Controller.destroy();
      if (!compatibilityMode) {
        cancelAnimationFrame(frameId);
      }
      // 实际上不应该清理，因为跳转到设置界面再回来就没了
      // StageManager.destroy();
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
