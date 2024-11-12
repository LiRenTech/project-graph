import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Color } from "../../dataStruct/Color";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Stage } from "../../stage/Stage";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { ConnectableEntity } from "../StageObject";
import { CollisionBox } from "../collisionBox/collisionBox";

/**
 *
 * 文字节点类
 * 2024年10月20日：Node 改名为 TextNode，防止与 原生 Node 类冲突
 */
export class TextNode extends ConnectableEntity {
  uuid: string;
  text: string;
  details: string;

  public collisionBox: CollisionBox;
  /**
   * 是否正在使用AI生成
   */
  public isAiGenerating: boolean = false;

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
    return this.rectangle.location
      .clone()
      .add(this.rectangle.size.clone().multiply(0.5));
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

  isEditingDetails: boolean = false;
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
    }: Partial<Serialized.Node> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.text = text;
    this.details = details;
    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size)),
    ]);
    this.color = new Color(...color);
    this.adjustSizeByText();
  }

  private adjustSizeByText() {
    this.collisionBox.shapeList[0] = new Rectangle(
      this.rectangle.location.clone(),
      getTextSize(this.text, Renderer.FONT_SIZE).add(
        Vector.same(Renderer.NODE_PADDING).multiply(2),
      ),
    );
  }

  rename(text: string) {
    this.text = text;
    this.adjustSizeByText();
  }

  changeDetails(details: string) {
    this.details = details;
  }

  move(delta: Vector) {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;

    // 移动雪花特效
    Stage.effects.push(
      new NodeMoveShadowEffect(
        new ProgressNumber(0, 30),
        this.rectangle,
        delta,
      ),
    );
  }

  moveTo(location: Vector) {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
  }
}
