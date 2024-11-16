import { invoke } from "@tauri-apps/api/core";
import { Serialized } from "../../../types/node";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity } from "../StageObject";

export class ImageNode extends ConnectableEntity {
  isHiddenBySectionCollapse: boolean = false;
  public uuid: string;
  public collisionBox: CollisionBox;

  /**
   * 这里的path是相对于工程文件的相对路径
   * 例如："example.png"
   */
  public path: string;
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

  private _base64String: string = "";

  public get base64String(): string {
    if (this._base64String !== "") {
      return this._base64String;
    } else {
      // 需要通过path获取base64String
      return "";
    }
  }
  
  private _imageElement: HTMLImageElement | null = null;
  
  public get imageElement(): HTMLImageElement {
    if (this._imageElement!== null) {
      return this._imageElement;
    } else {
      // 需要通过base64String创建imageElement
      const imageElement = new Image();
      imageElement.src = `data:image/png;base64,${this.base64String}`;
      imageElement.onload = () => {
        // 调整碰撞箱大小
        this.rectangle.size = new Vector(imageElement.width, imageElement.height);
      }
      return imageElement;
    }
  }

  /**
   * 用于粘贴板强制输入
   * @param base64String 
   */
  public setBase64StringForced(base64String: string) {
    this._base64String = base64String;
  }

  public get isLoaded(): boolean {
    return this._base64String !== "";
  }

  constructor(
    {
      uuid,
      location = [0, 0],
      path = "",
    }: Partial<Serialized.ImageNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.path = path;
    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...[100, 100])),
    ]);
  }

  /**
   * 
   * @param path 工程文件所在路径文件夹，不加尾部斜杠
   * @returns 
   */
  public updateBase64StringByPath(path: string) {
    if (this.path === "") {
      return;
    }
    invoke<string>("convert_image_to_base64", {
      imagePath: `${path}\\${this.path}`
    }).then((res) => {
      this._base64String = res;
    });
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

  move(delta: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;
  }
  moveTo(location: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
  }
}
