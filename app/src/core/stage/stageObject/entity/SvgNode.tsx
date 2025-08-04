import { Project } from "@/core/Project";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";
import { Color, Vector } from "@graphif/data-structures";
import { passExtraAtArg1, passObject, serializable } from "@graphif/serializer";
import { Rectangle } from "@graphif/shapes";

/**
 * Svg 节点
 */
@passExtraAtArg1
@passObject
export class SvgNode extends ConnectableEntity {
  @serializable
  color: Color = Color.Transparent;
  @serializable
  uuid: string;
  @serializable
  details: string;
  @serializable
  scale: number;
  @serializable
  collisionBox: CollisionBox;
  @serializable
  content: string;
  state: "loading" | "success" = "loading";
  isHiddenBySectionCollapse: boolean = false;

  originalSize: Vector = Vector.getZero();

  constructor(
    protected readonly project: Project,
    {
      uuid = crypto.randomUUID(),
      details = "",
      content = "",
      collisionBox = new CollisionBox([new Rectangle(Vector.getZero(), Vector.getZero())]),
      scale = 1,
      color = Color.Transparent,
    },
  ) {
    super();
    this.uuid = uuid;
    this.details = details;
    this.scale = scale;
    this.content = content;
    this.collisionBox = collisionBox;
    this.color = color;
    // 获取SVG原始大小
    this.project.svgRenderer.getSvgOriginalSize(content).then((size) => {
      this.originalSize = size;
      this.collisionBox = new CollisionBox([
        new Rectangle(this.collisionBox.getRectangle().location, this.originalSize.multiply(this.scale)),
      ]);
      this.state = "success";
    });
  }

  public get geometryCenter(): Vector {
    return this.collisionBox.getRectangle().center;
  }

  public scaleUpdate(scaleDiff: number) {
    this.scale += scaleDiff;
    if (this.scale < 0.1) {
      this.scale = 0.1;
    }
    if (this.scale > 10) {
      this.scale = 10;
    }

    this.collisionBox = new CollisionBox([
      new Rectangle(this.collisionBox.getRectangle().location, this.originalSize.multiply(this.scale)),
    ]);
  }

  move(delta: Vector): void {
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }

  moveTo(location: Vector): void {
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }

  /**
   * 修改SVG内容中的颜色
   * @param newColor 新颜色
   */
  changeColor(newColor: Color): void {
    this.color = newColor;
    const hexColor = newColor.toHexStringWithoutAlpha();

    // 替换常见的颜色属性
    this.content = this.content
      .replace(/(fill|stroke|stop-color|flood-color)="([^"]*)"/g, `$1="${hexColor}"`)
      .replace(/(fill|stroke|stop-color|flood-color):([^;"]*);/g, `$1:${hexColor};`)
      .replace(/(fill|stroke|stop-color|flood-color):([^;"]*)$/g, `$1:${hexColor}`);
  }
}
