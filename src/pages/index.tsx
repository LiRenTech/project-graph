import { Canvas } from "../core/Canvas";

export default function Home() {
  const init = async (el: HTMLDivElement) => {
    const canvasEl = await Canvas.init();
    el.parentNode?.replaceChild(canvasEl, el);
  };

  return <div ref={init}></div>;
}
