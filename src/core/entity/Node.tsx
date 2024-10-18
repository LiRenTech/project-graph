import { Serialized } from "../../types/node";
import { getTextSize } from "../../utils/font";
import { Color } from "../dataStruct/Color";
import { Rectangle } from "../dataStruct/Rectangle";
import { Renderer } from "../render/canvas2d/renderer";
import { Vector } from "../dataStruct/Vector";
import { StageManager } from "../stage/stageManager/StageManager";
import { Stage } from "../stage/Stage";
import { NodeMoveShadowEffect } from "../effect/concrete/NodeMoveShadowEffect";
import { ProgressNumber } from "../dataStruct/ProgressNumber";

export class Node {
  uuid: string;
  text: string;
  details: string;
  rectangle: Rectangle;

  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;

  public get isSelected() {
    return this._isSelected;
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
    this.uuid = uuid;
    this.text = text;
    this.details = details;
    this.rectangle = new Rectangle(
      new Vector(...location),
      new Vector(...size),
    );
    this.color = new Color(...color);
    this.adjustSizeByText();
  }

  private adjustSizeByText() {
    this.rectangle = new Rectangle(
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
    this.rectangle.location = this.rectangle.location.add(delta);
    Stage.effects.push(
      new NodeMoveShadowEffect(
        new ProgressNumber(0, 30),
        this.rectangle,
        delta,
      ),
    );
  }

  moveTo(location: Vector) {
    this.rectangle.location = location.clone();
  }
}
