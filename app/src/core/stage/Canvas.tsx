import { Project, service } from "@/core/Project";
import { Settings } from "@/core/service/Settings";

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
    this.ctx = element.getContext("2d", {
      alpha: Settings.sync.windowBackgroundAlpha !== 1,
    })!;
    if (Settings.sync.antialiasing === "disabled") {
      this.ctx.imageSmoothingEnabled = false;
    } else {
      this.ctx.imageSmoothingQuality = Settings.sync.antialiasing;
    }
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

  dispose() {
    this.element.remove();
  }
}
