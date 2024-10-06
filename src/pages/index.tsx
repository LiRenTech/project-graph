import { useEffect, useRef } from "react";
import { Renderer } from "../core/render/canvas2d/renderer";
import { useDialog } from "../utils/dialog";
import { Stage } from "../core/stage/Stage";
import { Controller } from "../core/controller/Controller";
import { Canvas } from "../core/stage/Canvas";
import { StageManager } from "../core/stage/stageManager/StageManager";
import React from "react";
import Toolbar from "./_toolbar";
import { Settings } from "../core/Settings";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);
  const [fps, setFps] = React.useState(0);

  const dialog = useDialog();
  const [cursorName, setCursorName] = React.useState("default");

  useEffect(() => {
    const handleResize = () => {
      if (canvasElement) {
        Renderer.resizeWindow(window.innerWidth, window.innerHeight);
      }
    };
    const handleFocus = () => {
      focus = true;
    };
    const handleBlur = () => {
      focus = false;
    };

    const canvasElement = canvasRef.current;
    let focus = true;

    if (canvasElement) {
      Canvas.init(canvasElement);
      Renderer.resizeWindow(window.innerWidth, window.innerHeight);
      Controller.init();
      Controller.setCursorName = setCursorName;
    } else {
      dialog.show({
        title: "错误",
        type: "error",
        content: "canvas元素不存在",
      });
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    Settings.get("windowBackgroundAlpha").then((value) => {
      Renderer.backgroundAlpha = value;
    });

    // 开启定时器
    let lastTime = performance.now();
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      if (!focus) {
        return;
      }
      // 计算FPS
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      setFps(1 / deltaTime);
      Renderer.frameTick();
      Stage.logicTick();
    };

    let frameId = requestAnimationFrame(loop);

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      Controller.destroy();
      cancelAnimationFrame(frameId);
      StageManager.destroy();
    };
  }, []);

  return (
    <>
      <Toolbar />
      <span className="fixed bottom-0 left-0 ring">FPS={fps.toFixed()}</span>
      <canvas ref={canvasRef} className={`cursor-${cursorName}`} />
    </>
  );
  // cursor-default
  // cursor-pointer
  // cursor-grab
  // cursor-grabbing
  // cursor-move

  // cursor-${cursorName}
}
