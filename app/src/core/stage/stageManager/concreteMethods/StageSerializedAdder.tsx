import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { CubicCatmullRomSplineEdge } from "../../stageObject/association/CubicCatmullRomSplineEdge";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { PenStroke } from "../../stageObject/entity/PenStroke";
import { PortalNode } from "../../stageObject/entity/PortalNode";
import { Section } from "../../stageObject/entity/Section";
import { SvgNode } from "../../stageObject/entity/SvgNode";
import { TextNode } from "../../stageObject/entity/TextNode";
import { UrlNode } from "../../stageObject/entity/UrlNode";
/**
 * 直接向舞台中添加序列化数据
 * 用于向舞台中附加新文件图、或者用于复制粘贴、甚至撤销
 */
@service("serializedDataAdder")
export class SerializedDataAdder {
  constructor(private readonly project: Project) {}

  /**
   * 将一个序列化信息加入舞台中
   * 会自动刷新新增部分的uuid
   * @param serializedData
   */
  addSerializedData(serializedData: Serialized.File, diffLocation = new Vector(0, 0)) {
    const updatedSerializedData = this.refreshUUID(serializedData);
    // TODO: 结构有待优化
    for (const entity of updatedSerializedData.entities) {
      let entityObject: Entity | null = null;
      if (Serialized.isTextNode(entity)) {
        entityObject = new TextNode(this.project, entity);
      } else if (Serialized.isSection(entity)) {
        entityObject = new Section(this.project, entity);
      } else if (Serialized.isConnectPoint(entity)) {
        entityObject = new ConnectPoint(this.project, entity);
      } else if (Serialized.isPenStroke(entity)) {
        entityObject = new PenStroke(this.project, entity);
      } else if (Serialized.isPortalNode(entity)) {
        entityObject = new PortalNode(this.project, entity);
      } else if (Serialized.isUrlNode(entity)) {
        entityObject = new UrlNode(this.project, entity);
      } else if (Serialized.isImageNode(entity)) {
        entityObject = new ImageNode(this.project, entity);
      } else if (Serialized.isSvgNode(entity)) {
        entityObject = new SvgNode(this.project, entity);
      }
      if (entityObject) {
        entityObject.moveTo(entityObject.collisionBox.getRectangle().location.add(diffLocation));
        this.project.stageManager.addEntity(entityObject);
      }
    }
    for (const edge of updatedSerializedData.associations) {
      if (Serialized.isLineEdge(edge)) {
        this.project.stageManager.addLineEdge(new LineEdge(this.project, edge));
      } else if (Serialized.isCubicCatmullRomSplineEdge(edge)) {
        this.project.stageManager.addCrEdge(new CubicCatmullRomSplineEdge(this.project, edge));
      }
    }
    this.project.stageManager.updateReferences();
  }

  private refreshUUID(serializedData: Serialized.File): Serialized.File {
    // 先深拷贝一份数据
    const result: Serialized.File = JSON.parse(JSON.stringify(serializedData));
    // 刷新实体UUID
    for (const entity of result.entities) {
      const oldUUID = entity.uuid;
      const newUUID = uuidv4();
      // 把这个实体所涉及的所有有向边对应的target和source的UUID也刷新
      for (const edge of result.associations) {
        if (Serialized.isEdge(edge)) {
          if (edge.source === oldUUID) {
            edge.source = newUUID;
          }
          if (edge.target === oldUUID) {
            edge.target = newUUID;
          }
        }
      }
      // 把这个实体所涉及的所有Section父子关系的UUID也刷新
      // 具体来说就是找到这个节点的父Section，把父Section的children数组中这个节点的UUID替换成新UUID
      for (const section of result.entities) {
        if (Serialized.isSection(section)) {
          if (section.children.includes(oldUUID)) {
            section.children = section.children.map((child) => (child === oldUUID ? newUUID : child));
          }
        }
      }

      // 刷新节点本身的UUID
      entity.uuid = newUUID;
    }

    // 刷新边的UUID
    for (const edge of result.associations) {
      edge.uuid = uuidv4();
      // HACK: 以后出了关系的关系，就要再分类了
    }
    return result;
  }
}
