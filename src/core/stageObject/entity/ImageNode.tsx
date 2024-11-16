import { invoke } from "@tauri-apps/api/core";
import { Serialized } from "../../../types/node";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity } from "../StageObject";
import { Stage } from "../../stage/Stage";
import { PathString } from "../../../utils/pathString";

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

  /**
   * 图片的三种状态
   */
  public state: "loading" | "success" | "error" = "loading";

  private _imageElement: HTMLImageElement = new Image();

  public get imageElement(): HTMLImageElement {
    return this._imageElement;
  }

  constructor(
    {
      uuid,
      location = [0, 0],
      size = [100, 100],
      path = "",
    }: Partial<Serialized.ImageNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.path = path;
    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size)),
    ]);
    this.state = "loading";
    // 初始化创建的时候，开始获取base64String
    if (!Stage.Path.isDraft()) {
      this.updateBase64StringByPath(
        PathString.dirPath(Stage.Path.getFilePath()),
      );
    } else {
      // 一般只有在粘贴板粘贴时和初次打开文件时才调用这里
      // 所以这里只可能时初次打开文件时还是草稿的状态
      
      setTimeout(() => {
        this.updateBase64StringByPath(
          PathString.dirPath(Stage.Path.getFilePath()),
        );
      }, 1000);
    }
  }

  /**
   *
   * @param folderPath 工程文件所在路径文件夹，不加尾部斜杠
   * @returns
   */
  public updateBase64StringByPath(folderPath: string) {
    if (this.path === "") {
      return;
    }

    invoke<string>("convert_image_to_base64", {
      imagePath: `${folderPath}\\${this.path}`,
    })
      .then((res) => {
        // 获取base64String成功

        this._base64String = res;
        const imageElement = new Image();
        this._imageElement = imageElement;
        imageElement.src = `data:image/png;base64,${this._base64String}`;
        imageElement.onload = () => {
          // 图片加载成功
          console.log("图片加载成功");

          // 调整碰撞箱大小

          this.rectangle.size = new Vector(
            imageElement.width / (window.devicePixelRatio || 1),
            imageElement.height / (window.devicePixelRatio || 1),
          );
          this.state = "success";
        };
        imageElement.onerror = () => {
          console.log("图片加载失败");
          this.state = "error";
        };
      })
      .catch((err) => {
        // 获取base64String失败
        console.log("图片可能不存在？", err);
        this.state = "error";
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
