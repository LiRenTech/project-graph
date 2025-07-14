import { v4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { Color } from "../../../dataStruct/Color";
import { Line } from "../../../dataStruct/shape/Line";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Shape } from "../../../dataStruct/shape/Shape";
import { Vector } from "../../../dataStruct/Vector";
import { StageManager } from "../../stageManager/StageManager";
import { ConnectableAssociation } from "../abstract/Association";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";
import { getMultiLineTextSize } from "../../../../utils/font";
import { Renderer } from "../../../render/canvas2d/renderer";
import { HyperGraphMethods } from "../../stageManager/basicMethods/HyperGraphMethods";

/**
 * 多端无向边
 *
 * 超边。
 * 以后可以求最大强独立集
 */
export class MultiTargetUndirectedEdge extends ConnectableAssociation {
  public uuid: string;

  get collisionBox(): CollisionBox {
    // 计算多个节点的外接矩形的中心点
    const nodes = StageManager.getEntitiesByUUIDs(this.targetUUIDs);
    const center = this.centerLocation;

    const shapeList: Shape[] = [];
    for (const node of nodes) {
      const line = new Line(center, node.collisionBox.getRectangle().center);
      shapeList.push(line);
    }
    return new CollisionBox(shapeList);
  }

  public text: string;
  public color: Color;
  public targetUUIDs: string[];
  public rectRates: Vector[];
  public centerRate: Vector;
  public arrow: Serialized.UndirectedEdgeArrowType = "none";
  public renderType: Serialized.MultiTargetUndirectedEdgeRenderType = "line";
  public padding: number;

  public rename(text: string) {
    this.text = text;
  }
  constructor(
    {
      targets,
      text,
      uuid,
      color,
      rectRates,
      arrow,
      centerRate,
      padding,
      renderType,
    }: Serialized.MultiTargetUndirectedEdge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    super();

    this.text = text;
    this.uuid = uuid;
    this.color = new Color(...color);
    this.targetUUIDs = targets;
    this.rectRates = rectRates.map((v) => new Vector(v[0], v[1]));
    this.centerRate = new Vector(centerRate[0], centerRate[1]);
    this.arrow = arrow;
    this.renderType = renderType;
    this.padding = padding;
  }

  /**
   * 获取中心点
   */
  public get centerLocation(): Vector {
    if (this.targetUUIDs.length === 2) {
      // 和lineEdge保持一样的逻辑
      const twoNode = StageManager.getEntitiesByUUIDs(this.targetUUIDs);
      const line = new Line(
        twoNode[0].collisionBox.getRectangle().center,
        twoNode[1].collisionBox.getRectangle().center,
      );
      return line.midPoint();
    }
    const boundingRectangle = Rectangle.getBoundingRectangle(
      StageManager.getEntitiesByUUIDs(this.targetUUIDs).map((n) => n.collisionBox.getRectangle()),
    );
    return boundingRectangle.getInnerLocationByRateVector(this.centerRate);
  }

  get textRectangle(): Rectangle {
    // HACK: 这里会造成频繁渲染，频繁计算文字宽度进而可能出现性能问题
    const textSize = getMultiLineTextSize(this.text, Renderer.FONT_SIZE, 1.2);
    return new Rectangle(this.centerLocation.subtract(textSize.divide(2)), textSize);
  }

  static createFromSomeEntity(entities: ConnectableEntity[]) {
    // 自动计算padding
    let padding = 10;
    for (const entity of entities) {
      const hyperEdges = HyperGraphMethods.getHyperEdgesByNode(entity);
      if (hyperEdges.length > 0) {
        const maxPadding = Math.max(...hyperEdges.map((e) => e.padding));
        padding = Math.max(maxPadding + 10, padding);
      }
    }

    const targetUUIDs = entities.map((e) => e.uuid);
    return new MultiTargetUndirectedEdge({
      type: "core:multi_target_undirected_edge",
      targets: targetUUIDs,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rectRates: entities.map((_) => [0.5, 0.5]),
      text: "",
      uuid: v4(),
      arrow: "none",
      centerRate: [0.5, 0.5],
      color: [0, 0, 0, 0],
      padding,
      renderType: "line",
    });
  }

  /**
   * 是否被选中
   */
  _isSelected: boolean = false;
  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
  }
}
