import { Color } from "../../../dataStruct/Color";
import { ConnectableEntity } from "./ConnectableEntity";
import { StageObject } from "./StageObject";

/**
 * 一切连接关系的抽象
 */
export abstract class Association extends StageObject {
  public associationList: StageObject[] = [];

  /**
   * 任何关系都应该有一个颜色用来标注
   */
  public color: Color = Color.Transparent;
}

/**
 * 一切可被连接的关联
 */
export abstract class ConnectableAssociation extends Association {
  public override associationList: ConnectableEntity[] = [];

  public reverse() {
    const temp = this.associationList[0];
    this.associationList[0] = this.associationList[1];
    this.associationList[1] = temp;
  }

  get target(): ConnectableEntity {
    return this.associationList[0];
  }

  set target(value: ConnectableEntity) {
    this.associationList[0] = value;
  }

  get source(): ConnectableEntity {
    return this.associationList[1];
  }
  set source(value: ConnectableEntity) {
    this.associationList[1] = value;
  }
}
