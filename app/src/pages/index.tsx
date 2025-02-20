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
import DetailsEditSidePanel from "./_details_edit_side_panel";
import DetailsEditSmallPanel from "./_details_edit_small_panel";
import HintText from "./_hint_text";
import Toolbar from "./_toolbar";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);

  const [cursorName, setCursorName] = React.useState(CursorNameEnum.Default);
  const [bgAlpha, setBgAlpha] = React.useState(0.9);
  const [uiShow, setUIShow] = React.useState(true);
  const [nodeDetailsPanel] = Settings.use("nodeDetailsPanel");
  const [isProtectPrivacy, setIsProtectPrivacy] = React.useState(false);

  const [isWindowCollapsing] = useAtom(isWindowCollapsingAtom);
  const [isClassroomMode] = useAtom(isClassroomModeAtom);

  useEffect(() => {
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

    Settings.watch("protectingPrivacy", (value) => {
      setIsProtectPrivacy(value);
    });
    Settings.watch("windowBackgroundAlpha", (value) => {
      setBgAlpha(value);
    });
    Settings.watch("showTipsOnUI", (value) => {
      setUIShow(value);
    });

    // 开启定时器
    let lastTime = performance.now();
    // let i = 0;
    const loop = () => {
      frameId = requestAnimationFrame(loop);
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

    let frameId = requestAnimationFrame(loop);

    // Settings.watch("nodeDetailsPanel", (value) => {
    //   setNodeDetailsPanel(value);
    // });

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      Controller.destroy();
      cancelAnimationFrame(frameId);
      // 实际上不应该清理，因为跳转到设置界面再回来就没了
      // StageManager.destroy();
    };
  }, []);

  return (
    <>
      {!isWindowCollapsing && !isClassroomMode && <Toolbar />}
      {/* 这个打算被取代 */}
      {nodeDetailsPanel === "small" ? <DetailsEditSmallPanel /> : <DetailsEditSidePanel />}
      {!isWindowCollapsing && !isClassroomMode && uiShow && <HintText />}
      {/* TODO: 下面这个写法有点奇怪 rgba值太长了 */}
      <div
        style={{
          background: `rgba(${StageStyleManager.currentStyle.BackgroundColor.r},${StageStyleManager.currentStyle.BackgroundColor.g},${StageStyleManager.currentStyle.BackgroundColor.b},${isProtectPrivacy ? 1 : bgAlpha})`,
        }}
      >
        <canvas ref={canvasRef} className={cursorName} />
      </div>
    </>
  );
}
