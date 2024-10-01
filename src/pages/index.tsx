import { useEffect, useRef } from "react";
import { Renderer } from "../core/render/canvas2d/renderer";
import { useDialog } from "../utils/dialog";
import { Stage } from "../core/stage/Stage";
import { Controller } from "../core/controller/Controller";
import Camera from "../core/stage/Camera";
import { Canvas } from "../core/Canvas";
import { NodeManager } from "../core/NodeManager";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);

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

    const canvasElement = canvasRef.current;
    const stage = new Stage(new Camera());

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
    // 开启定时器
    const loop = () => {
      render?.frameTick();
      stage.logicTick();
      frameId = requestAnimationFrame(loop);
    };

    let frameId = requestAnimationFrame(loop);

    // 清理事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
      controller?.destroy();
      cancelAnimationFrame(frameId);
      NodeManager.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
