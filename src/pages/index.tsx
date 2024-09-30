import { useEffect, useRef } from "react";
import { Render } from "../core/render/canvas2d/render";
import { useDialog } from "../utils/dialog";
import { Stage } from "../core/stage/Stage";
import { Controller } from "../core/controller/Controller";
import Camera from "../core/stage/Camera";
import { Canvas } from "../core/Canvas";

export default function Home() {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);
  const canvasWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);

  const dialog = useDialog();

  /**
   * 渲染器
   */
  let render: Render | null = null;
  let controller: Controller | null = null;

  useEffect(() => {
    const handleResize = () => {
      if (canvasWrapperRef.current) {
        const { width, height } =
          canvasWrapperRef.current.getBoundingClientRect();
        render?.resizeWindow(width, height);
        console.log("resize", width, height);
      }
    };

    const canvasElement = canvasRef.current;
    const stage = new Stage(new Camera());

    if (canvasElement) {
      const canvasObject = new Canvas(canvasElement!);

      render = new Render(
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
    };
  }, []);

  return (
    <div ref={canvasWrapperRef} className="h-full w-full bg-stone-900">
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full ring"
      />
    </div>
  );
}
