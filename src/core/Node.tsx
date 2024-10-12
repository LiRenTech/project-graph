import { Serialized } from "../types/node";
import { getTextSize } from "../utils/font";
import { Color } from "./dataStruct/Color";
import { Rectangle } from "./dataStruct/Rectangle";
import { Renderer } from "./render/canvas2d/renderer";
import { Vector } from "./dataStruct/Vector";

export class Node {
  uuid: string;
  text: string;
  details: string;
  children: Node[];
  rectangle: Rectangle;

  /**
   * 节点是否被选中
   */
  isSelected: boolean = false;

  /**
   * 是否在编辑文字，编辑时不渲染文字
   */
  isEditing: boolean = false;

  color: Color | null = Color.Black;

  constructor(
    {
      uuid,
      text = "",
      details = "",
      children = [],
      location = [0, 0],
      size = [0, 0],
      color = [0, 0, 0, 0],
    }: Partial<Serialized.Node> & { uuid: string },
    public unknown = false,
  ) {
    this.uuid = uuid;
    this.text = text;
    this.details = details;
    this.children = children.map(
      (childUUID) => new Node({ uuid: childUUID }, true),
    );
    this.rectangle = new Rectangle(
      new Vector(...location),
      new Vector(...size),
    );
    this.color = color && new Color(...color);
    this.adjustSizeByText();
  }

  adjustSizeByText() {
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
  }

  moveWithChildren(delta: Vector) {
    this.moveWithChildrenDfs(this, delta, [this.uuid]);
  }

  private moveWithChildrenDfs(
    node: Node,
    delta: Vector,
    visitedUUIDs: string[],
  ) {
    node.move(delta);
    for (const child of node.children) {
      if (visitedUUIDs.includes(child.uuid)) {
        continue;
      }
      visitedUUIDs.push(child.uuid);
      this.moveWithChildrenDfs(child, delta, visitedUUIDs);
    }
  }

  moveTo(location: Vector) {
    this.rectangle.location = location.clone();
  }

  addChild(child: Node): boolean {
    // 不能添加自己
    if (child.uuid === this.uuid) {
      return false;
    }
    // 不能重复添加
    if (this.children.some((c) => c.uuid === child.uuid)) {
      return false;
    }
    this.children.push(child);
    return true;
  }

  removeChild(child: Node): boolean {
    if (this.children.some((c) => c.uuid === child.uuid)) {
      const index = this.children.indexOf(child);
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }
}
