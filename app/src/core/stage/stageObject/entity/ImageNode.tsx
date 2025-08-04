import { Project } from "@/core/Project";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";
import { Vector } from "@graphif/data-structures";
import { passExtraAtArg1, passObject, serializable } from "@graphif/serializer";
import { Rectangle } from "@graphif/shapes";

/**
 * 一个图片节点
 * 图片的路径字符串决定了这个图片是什么
 *
 * 有两个转换过程：
 *
 * 图片路径 -> base64字符串 -> 图片Element -> 完成
 *   gettingBase64
 *     |
 *     v
 *   fileNotfound
 *   base64EncodeError
 *
 */
@passExtraAtArg1
@passObject
export class ImageNode extends ConnectableEntity {
  isHiddenBySectionCollapse: boolean = false;
  @serializable
  public uuid: string;
  @serializable
  public collisionBox: CollisionBox;
  @serializable
  details: string;
  @serializable
  attachmentId: string;
  @serializable
  scale: number;
  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;

  /**
   * 获取节点的选中状态
   */
  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    this._isSelected = value;
  }

  bitmap: ImageBitmap | undefined;
  state: "loading" | "success" | "notFound" = "loading";

  constructor(
    protected readonly project: Project,
    {
      uuid = crypto.randomUUID() as string,
      collisionBox = new CollisionBox([new Rectangle(Vector.getZero(), Vector.getZero())]),
      details = "",
      attachmentId = "",
      scale = 1,
    },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.collisionBox = collisionBox;
    this.details = details;
    this.attachmentId = attachmentId;
    this.scale = scale;

    const blob = project.attachments.get(attachmentId);
    if (!blob) {
      this.state = "notFound";
      return;
    }
    createImageBitmap(blob).then((bitmap) => {
      this.bitmap = bitmap;
      this.state = "success";
      // 设置碰撞箱
      this.scaleUpdate(0);
    });
  }

  public scaleUpdate(scaleDiff: number) {
    this.scale += scaleDiff;
    if (this.scale < 0.1) {
      this.scale = 0.1;
    }
    if (this.scale > 10) {
      this.scale = 10;
    }
    if (!this.bitmap) return;
    this.collisionBox = new CollisionBox([
      new Rectangle(this.rectangle.location, new Vector(this.bitmap.width, this.bitmap.height).multiply(this.scale)),
    ]);
  }

  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    return this.collisionBox.shapes[0] as Rectangle;
  }

  public get geometryCenter() {
    return this.rectangle.location.clone().add(this.rectangle.size.clone().multiply(0.5));
  }

  move(delta: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
  moveTo(location: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
}
