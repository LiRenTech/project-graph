import { Serialized } from "../../../../types/node";
import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";

export class PortalNode extends ConnectableEntity {
  /**
   * 标题标记线
   */
  static TITLE_LINE_Y = 60;
  /**
   * 路径标记线
   */
  static PATH_LINE_Y = 120;
  public isEditingTitle: boolean = false;
  public rename(newTitle: string): void {
    this.title = newTitle;
    this.updateFatherSectionByMove();
  }

  public titleRectangleArea(): Rectangle {
    return new Rectangle(this.location, new Vector(this.size.x, PortalNode.TITLE_LINE_Y));
  }
  public pathRectangleArea(): Rectangle {
    return new Rectangle(
      this.location.add(new Vector(0, PortalNode.TITLE_LINE_Y)),
      new Vector(this.size.x, PortalNode.PATH_LINE_Y - PortalNode.TITLE_LINE_Y),
    );
  }

  isHiddenBySectionCollapse: boolean = false;
  public uuid: string;
  public collisionBox: CollisionBox;

  public title: string;
  public size: Vector;
  get location(): Vector {
    return this.collisionBox.getRectangle().location;
  }
  color: Color = Color.Transparent;
  public portalFilePath: string;
  public targetLocation: Vector;
  public cameraScale: number;

  constructor(
    {
      uuid,
      title = "",
      portalFilePath = "",
      targetLocation = [0, 0],
      cameraScale = 1,
      location = [0, 0],
      size = [0, 0],
      color = [0, 0, 0, 0],
    }: Partial<Serialized.PortalNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.title = title;
    this.size = new Vector(...size);
    this.color = new Color(...color);
    this.portalFilePath = portalFilePath;
    this.targetLocation = new Vector(...targetLocation);
    this.cameraScale = cameraScale;
    this.collisionBox = new CollisionBox([new Rectangle(new Vector(...location), new Vector(...size))]);
  }

  public get geometryCenter() {
    return this.collisionBox.getRectangle().center;
  }
  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    return this.collisionBox.shapeList[0] as Rectangle;
  }

  move(delta: Vector): void {
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;

    // 移动雪花特效
    // this.project.effects.addEffect(new NodeMoveShadowEffect(new ProgressNumber(0, 30), newRectangle, delta));
    this.updateFatherSectionByMove();
    // 移动其他实体，递归碰撞
    this.updateOtherEntityLocationByMove();
    this.updateChildStageCameraData();
  }
  moveTo(location: Vector): void {
    const newRectangle = this.collisionBox.getRectangle();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.updateFatherSectionByMove();
    this.updateChildStageCameraData();
  }

  private updateChildStageCameraData() {
    // TODO: updateChildStageCameraData
    // this.project.stageManager.updateChildStageCameraData(
    //   PathString.relativePathToAbsolutePath(PathString.dirPath(Stage.path.getFilePath()), this.portalFilePath),
    //   {
    //     location: this.location,
    //     targetLocation: this.targetLocation,
    //     size: this.size,
    //     zoom: this.cameraScale,
    //   },
    // );
  }

  public moveTargetLocation(delta: Vector): void {
    this.targetLocation = this.targetLocation.add(delta);
    this.updateChildStageCameraData();
  }

  public moveToTargetLocation(targetLocation: Vector): void {
    this.targetLocation = targetLocation;
    this.updateChildStageCameraData();
  }

  /**
   * 扩大窗口
   */
  public expand() {
    const rect = this.collisionBox.shapeList[0] as Rectangle;
    rect.size = rect.size.add(new Vector(100, 100));
    this.size = rect.size;
    this.updateChildStageCameraData();
  }

  /**
   * 缩小窗口
   * @returns
   */
  public shrink() {
    const rect = this.collisionBox.shapeList[0] as Rectangle;
    if (rect.size.x <= 100 || rect.size.y <= 100) {
      return;
    }
    rect.size = rect.size.subtract(new Vector(100, 100));
    this.size = rect.size;
    this.updateChildStageCameraData();
  }

  public zoomIn() {
    this.cameraScale *= 1.1;
    if (this.cameraScale > 10) {
      this.cameraScale = 10;
    }
    this.updateChildStageCameraData();
  }

  public zoomOut() {
    this.cameraScale /= 1.1;
    if (this.cameraScale < 0.1) {
      this.cameraScale = 0.1;
    }
    this.updateChildStageCameraData();
  }
}
