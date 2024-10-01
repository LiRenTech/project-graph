import { useEffect, useRef } from "react";
import { Renderer } from "../core/render/canvas2d/renderer";
import { useDialog } from "../utils/dialog";
import { Stage } from "../core/stage/Stage";
import { Controller } from "../core/controller/Controller";
import Camera from "../core/stage/Camera";
import { Canvas } from "../core/Canvas";
import { NodeManager } from "../core/NodeManager";
import React from "react";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);
  const [fps, setFps] = React.useState(0);

  const dialog = useDialog();

  /**
   * 渲染器
   */
  let render: Renderer | null = null;
  let controller: Controller | null = null;

  useEffect(() => {
    const handleResize = () => {
      if (canvasElement) {
        render?.resizeWindow(window.innerWidth, window.innerHeight);
      }
    };
    const handleFocus = () => {
      focus = true;
    };
    const handleBlur = () => {
      focus = false;
    };

    const canvasElement = canvasRef.current;
    const stage = new Stage(new Camera());
    let focus = true;

    if (canvasElement) {
      const canvasObject = new Canvas(canvasElement);

      render = new Renderer(
        canvasObject,
        window.innerWidth,
        window.innerHeight,
        stage,
      );
      controller = new Controller(canvasElement, stage, render);
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
      render?.frameTick();
      stage.logicTick();
    };

    let frameId = requestAnimationFrame(loop);

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      controller?.destroy();
      cancelAnimationFrame(frameId);
      NodeManager.destroy();
    };
  }, []);

  return (
    <>
      <span className="fixed left-0 top-0">FPS={fps.toFixed()}</span>
      <canvas ref={canvasRef} />
    </>
  );
}
