import { useEffect, useRef } from "react";
import { Renderer } from "../core/render/canvas2d/renderer";
import { useDialog } from "../utils/dialog";
import { Stage } from "../core/stage/Stage";
import { Controller } from "../core/controller/Controller";
import { Canvas } from "../core/stage/Canvas";
import React from "react";
import Toolbar from "./_toolbar";
import { Settings } from "../core/Settings";
import DetailsEditPanel from "./_details_edit_panel";
import SearchingNodePanel from "./_searching_node_panel";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);

  const dialog = useDialog();
  const [cursorName, setCursorName] = React.useState("default");
  const [bgAlpha, setBgAlpha] = React.useState(1);

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
      setBgAlpha(value);
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
      Renderer.frameTick();
      Stage.logicTick();
      // i++;
    };

    let frameId = requestAnimationFrame(loop);

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
      <Toolbar />
      <SearchingNodePanel />
      <DetailsEditPanel />

      <div
        style={{
          background: `rgba(31,31,31,${bgAlpha})`,
        }}
      >
        <canvas ref={canvasRef} className={`cursor-${cursorName}`} />
      </div>
    </>
  );
}
