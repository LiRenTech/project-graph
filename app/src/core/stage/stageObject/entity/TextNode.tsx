import { Serialized } from "../../../../types/node";
import { getMultiLineTextSize } from "../../../../utils/font";
import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { TextRenderer } from "../../../render/canvas2d/basicRenderer/textRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { NodeMoveShadowEffect } from "../../../service/feedbackService/effectEngine/concrete/NodeMoveShadowEffect";
import { Stage } from "../../Stage";
import { StageManager } from "../../stageManager/StageManager";
import { SectionMethods } from "../../stageManager/basicMethods/SectionMethods";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { Entity } from "../abstract/StageEntity";
import { ResizeAble } from "../abstract/StageObjectInterface";
import { CollisionBox } from "../collisionBox/collisionBox";
import { Section } from "./Section";

/**
 *
 * 文字节点类
 * 2024年10月20日：Node 改名为 TextNode，防止与 原生 Node 类冲突
 */
export class TextNode extends ConnectableEntity implements ResizeAble {
  uuid: string;
  text: string;
  details: string;

  public collisionBox: CollisionBox;
  /**
   * 是否正在使用AI生成
   */
  public isAiGenerating: boolean = false;

  public static enableResizeCharCount = 20;

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

  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    return this.collisionBox.shapeList[0] as Rectangle;
  }

  public get geometryCenter() {
    return this.rectangle.location.clone().add(this.rectangle.size.clone().multiply(0.5));
  }

  public set isSelected(value: boolean) {
    const oldValue = this._isSelected;
    this._isSelected = value;
    if (oldValue !== value) {
      if (oldValue === true) {
        // 减少了一个选中节点
        StageManager.selectedNodeCount--;
      } else {
        // 增加了一个选中节点
        StageManager.selectedNodeCount++;
      }
    }
  }

  /**
   * 是否在编辑文字，编辑时不渲染文字
   */
  isEditing: boolean = false;

  isHiddenBySectionCollapse = false;

  color: Color = Color.Transparent;
  constructor(
    {
      uuid,
      text = "",
      details = "",
      location = [0, 0],
      size = [0, 0],
      color = [0, 0, 0, 0],
    }: Partial<Serialized.TextNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.text = text;
    this.details = details;
    this.collisionBox = new CollisionBox([new Rectangle(new Vector(...location), new Vector(...size))]);
    this.color = new Color(...color);
    if (this.text.length < TextNode.enableResizeCharCount) {
      this.adjustSizeByText();
    }
  }

  /**
   * 调整后的矩形是当前文字加了一圈padding之后的大小
   */
  private adjustSizeByText() {
    this.collisionBox.shapeList[0] = new Rectangle(
      this.rectangle.location.clone(),
      getMultiLineTextSize(this.text, Renderer.FONT_SIZE, 1.5).add(Vector.same(Renderer.NODE_PADDING).multiply(2)),
    );
  }

  rename(text: string) {
    this.text = text;
    if (this.text.length < TextNode.enableResizeCharCount) {
      this.adjustSizeByText();
    }
  }

  resizeHandle(delta: Vector) {
    const currentRect: Rectangle = this.collisionBox.shapeList[0] as Rectangle;
    const newRectangle = currentRect.clone();
    // todo：宽度能自定义控制，但是高度不能
    const newSize = newRectangle.size.add(delta);
    newSize.x = Math.max(75, newSize.x);
    const newTextSize = TextRenderer.measureMultiLineTextSize(
      this.text,
      Renderer.FONT_SIZE,
      newSize.x - Renderer.NODE_PADDING * 2,
      1.5,
    );
    newSize.y = newTextSize.y + Renderer.NODE_PADDING * 2;
    newRectangle.size = newSize;

    this.collisionBox.shapeList[0] = newRectangle;
  }

  getResizeHandleRect(): Rectangle {
    const rect = this.collisionBox.getRectangle();
    return new Rectangle(rect.rightTop, new Vector(25, rect.size.y));
  }

  /**
   * 将某个物体移动一小段距离
   * @param delta
   */
  move(delta: Vector) {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;

    // 移动雪花特效
    Stage.effectMachine.addEffect(new NodeMoveShadowEffect(new ProgressNumber(0, 30), this.rectangle, delta));
    this.updateFatherSectionByMove();
    // 移动其他实体，递归碰撞
    this.updateOtherEntityLocationByMove();
  }

  protected override collideWithOtherEntity(other: Entity): void {
    if (!StageManager.isEnableEntityCollision) {
      return;
    }
    if (other instanceof Section) {
      // 如果碰撞的东西是一个section
      // 如果自己是section的子节点，则不移动
      if (SectionMethods.isEntityInSection(this, other)) {
        return;
      }
    }
    super.collideWithOtherEntity(other);
  }

  /**
   * 将某个物体 的最小外接矩形的左上角位置 移动到某个位置
   * @param location
   */
  moveTo(location: Vector) {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
}
