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

/**
 * 多端无向边
 */
export class MultiTargetUndirectedEdge extends ConnectableAssociation {
  public uuid: string;

  get collisionBox(): CollisionBox {
    // 计算多个节点的外接矩形的中心点
    const nodes = StageManager.getEntitiesByUUIDs(this.targetUUIDs);
    const boundingRectangle = Rectangle.getBoundingRectangle(nodes.map((n) => n.collisionBox.getRectangle()));
    const center = boundingRectangle.center;

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

  public rename(text: string) {
    this.text = text;
  }
  constructor(
    { targets, text, uuid, color, rectRates }: Serialized.MultiTargetUndirectedEdge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    super();

    this.text = text;
    this.uuid = uuid;
    this.color = new Color(...color);
    this.targetUUIDs = targets;
    this.rectRates = rectRates.map((v) => new Vector(v[0], v[1]));
  }

  static createFromSomeEntity(entities: ConnectableEntity[]) {
    const targetUUIDs = entities.map((e) => e.uuid);
    return new MultiTargetUndirectedEdge({
      type: "core:multi_target_undirected_edge",
      targets: targetUUIDs,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rectRates: entities.map((_) => [0.5, 0.5]),
      text: "",
      uuid: v4(),
      color: [0, 0, 0, 0],
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
