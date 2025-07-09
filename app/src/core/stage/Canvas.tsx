import { Project, service } from "../Project";

/**
 * 将Canvas标签和里面的ctx捏在一起封装成一个类
 */
@service("canvas")
export class Canvas {
  ctx: CanvasRenderingContext2D;

  constructor(
    private readonly project: Project,
    public element: HTMLCanvasElement = document.createElement("canvas"),
  ) {
    element.tabIndex = 0;
    element.addEventListener("mousemove", () => element.focus());
    this.ctx = element.getContext("2d")!;
  }

  mount(wrapper: HTMLDivElement) {
    wrapper.innerHTML = "";
    wrapper.appendChild(this.element);
    // 监听画布大小变化
    const resizeObserver = new ResizeObserver(() => {
      this.project.renderer.resizeWindow(wrapper.clientWidth, wrapper.clientHeight);
    });
    resizeObserver.observe(wrapper);
  }
}
