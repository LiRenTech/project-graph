import { join } from "@tauri-apps/api/path";
import { Serialized } from "../../../../types/node";
import { readFileBase64 } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Stage } from "../../Stage";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity } from "../StageObject";

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
  details: string;
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
  public state: "loading" | "success" | "unknownError" | "encodingError" =
    "loading";

  public errorDetails: string = "";

  private _imageElement: HTMLImageElement = new Image();

  public get imageElement(): HTMLImageElement {
    return this._imageElement;
  }
  public scaleNumber: number = 1 / (window.devicePixelRatio || 1);
  public originImageSize: Vector = new Vector(0, 0);
  /** 左上角位置 */
  private get currentLocation() {
    return this.rectangle.location.clone();
  }

  constructor(
    {
      uuid,
      location = [0, 0],
      size = [100, 100],
      scale = 1 / (window.devicePixelRatio || 1),
      path = "",
      details = "",
    }: Partial<Serialized.ImageNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.path = path;
    this.details = details;
    this.scaleNumber = scale;
    this.originImageSize = new Vector(...size);

    this.collisionBox = new CollisionBox([
      new Rectangle(
        new Vector(...location),
        new Vector(...size).multiply(this.scaleNumber),
      ),
    ]);
    this.state = "loading";
    // 初始化创建的时候，开始获取base64String
    if (!Stage.path.isDraft()) {
      this.updateBase64StringByPath(
        PathString.dirPath(Stage.path.getFilePath()),
      );
    } else {
      // 一般只有在粘贴板粘贴时和初次打开文件时才调用这里
      // 所以这里只可能时初次打开文件时还是草稿的状态

      setTimeout(() => {
        this.updateBase64StringByPath(
          PathString.dirPath(Stage.path.getFilePath()),
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

    join(folderPath, this.path)
      .then((path) => readFileBase64(path))
      .then((res) => {
        // 获取base64String成功

        this._base64String = res;
        const imageElement = new Image();
        this._imageElement = imageElement;
        imageElement.src = `data:image/png;base64,${this._base64String}`;
        imageElement.onload = () => {
          // 图片加载成功

          // 调整碰撞箱大小

          this.rectangle.size = new Vector(
            imageElement.width * this.scaleNumber,
            imageElement.height * this.scaleNumber,
          );
          this.originImageSize = new Vector(
            imageElement.width,
            imageElement.height,
          );
          this.state = "success";
        };
        imageElement.onerror = () => {
          this.state = "encodingError";
          this.errorDetails = "图片编码错误";
        };
      })

      .catch((_err) => {
        // 获取base64String失败
        // TODO: 图片上显示ErrorDetails信息
        this.state = "unknownError";
        this.errorDetails = _err.toString();
      });
  }

  /**
   * 刷新，这个方法用于重新从路径中加载图片
   */
  public refresh() {
    this.updateBase64StringByPath(PathString.dirPath(Stage.path.getFilePath()));
  }

  public scaleUpdate(scaleDiff: number) {
    this.scaleNumber += scaleDiff;
    if (this.scaleNumber < 0.1) {
      this.scaleNumber = 0.1;
    }
    if (this.scaleNumber > 10) {
      this.scaleNumber = 10;
    }

    this.collisionBox = new CollisionBox([
      new Rectangle(
        this.currentLocation,
        this.originImageSize.multiply(this.scaleNumber),
      ),
    ]);
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
    this.updateFatherSectionByMove();
  }
  moveTo(location: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
}
