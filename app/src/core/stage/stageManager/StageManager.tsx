import { v4 } from "uuid";
import { Direction } from "../../../types/directions";
import { Serialized } from "../../../types/node";
import { PathString } from "../../../utils/pathString";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { StringDict } from "../../dataStruct/StringDict";
import { Vector } from "../../dataStruct/Vector";
import { Project, service } from "../../Project";
import { EntityShrinkEffect } from "../../service/feedbackService/effectEngine/concrete/EntityShrinkEffect";
import { PenStrokeDeletedEffect } from "../../service/feedbackService/effectEngine/concrete/PenStrokeDeletedEffect";
import { TextRiseEffect } from "../../service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { Settings } from "../../service/Settings";
import { Association } from "../stageObject/abstract/Association";
import { ConnectableEntity } from "../stageObject/abstract/ConnectableEntity";
import { Entity } from "../stageObject/abstract/StageEntity";
import { StageObject } from "../stageObject/abstract/StageObject";
import { CubicCatmullRomSplineEdge } from "../stageObject/association/CubicCatmullRomSplineEdge";
import { Edge } from "../stageObject/association/Edge";
import { LineEdge } from "../stageObject/association/LineEdge";
import { MultiTargetUndirectedEdge } from "../stageObject/association/MutiTargetUndirectedEdge";
import { ConnectPoint } from "../stageObject/entity/ConnectPoint";
import { ImageNode } from "../stageObject/entity/ImageNode";
import { PenStroke } from "../stageObject/entity/PenStroke";
import { PortalNode } from "../stageObject/entity/PortalNode";
import { Section } from "../stageObject/entity/Section";
import { SvgNode } from "../stageObject/entity/SvgNode";
import { TextNode } from "../stageObject/entity/TextNode";
import { UrlNode } from "../stageObject/entity/UrlNode";
import { GraphMethods } from "./basicMethods/GraphMethods";
import { StageHistoryManager } from "./StageHistoryManager";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例

type StageContent = {
  entities: StringDict<Entity>;
  associations: StringDict<Association>;
  tags: string[];
};

/**
 * 子场景的相机数据
 */
export type ChildCameraData = {
  /**
   * 传送门的左上角位置
   */
  location: Vector;
  zoom: number;
  /**
   * 传送门大小
   */
  size: Vector;
  /**
   * 相机的目标位置
   */
  targetLocation: Vector;
};

/**
 * 舞台管理器，也可以看成包含了很多操作方法的《舞台实体容器》
 * 管理节点、边的关系等，内部包含了舞台上的所有实体
 */
@service("stageManager")
export class StageManager {
  private readonly stageContent: StageContent = {
    entities: StringDict.create(),
    associations: StringDict.create(),
    tags: [],
  };

  getStageContentDebug() {
    return this.stageContent.entities.length;
  }

  getStageJsonByPlugin(): string {
    return JSON.stringify(this.stageContent);
  }
  /**
   * 子舞台，用于渲染传送门中的另一个世界
   * key：绝对路径构成的字符串，用于区分不同的子舞台
   */
  private readonly childStageContent: Record<string, StageContent> = {};

  /**
   * 每一个子舞台的相机数据，用于渲染传送门中的另一个世界
   */
  private readonly childStageCameraData: Record<string, ChildCameraData> = {};

  updateChildStageCameraData(path: string, data: ChildCameraData) {
    this.childStageCameraData[path] = data;
  }
  getChildStageCameraData(path: string) {
    return this.childStageCameraData[path];
  }

  storeMainStage() {
    this.childStageContent["main"] = {
      entities: this.stageContent.entities.clone(),
      associations: this.stageContent.associations.clone(),
      tags: [...this.stageContent.tags],
    };
  }
  restoreMainStage() {
    this.stageContent.associations = this.childStageContent["main"].associations.clone();
    this.stageContent.entities = this.childStageContent["main"].entities.clone();
    this.stageContent.tags = [...this.childStageContent["main"].tags];
  }
  storeMainStageToChildStage(path: string) {
    this.childStageContent[path] = {
      entities: this.stageContent.entities.clone(),
      associations: this.stageContent.associations.clone(),
      tags: [...this.stageContent.tags],
    };
  }
  storeChildStageToMainStage(path: string) {
    this.stageContent.associations = this.childStageContent[path].associations.clone();
    this.stageContent.entities = this.childStageContent[path].entities.clone();
    this.stageContent.tags = [...this.childStageContent[path].tags];
  }
  getAllChildStageKeys(): string[] {
    return Object.keys(this.childStageContent).filter((key) => key !== "main");
  }
  clearAllChildStage() {
    for (const key of Object.keys(this.childStageContent)) {
      if (key !== "main") {
        this.childStageContent[key].entities.clear();
        this.childStageContent[key].associations.clear();
        this.childStageContent[key].tags = [];
      }
    }
  }
  // 使用这个方法时要提前保证当前主舞台槽上放的是主舞台
  getAllChildStageKeysAndCamera(): { key: string; camera: ChildCameraData }[] {
    const result = [];
    for (const entity of this.getEntities().filter((entity) => entity instanceof PortalNode)) {
      const newKey = PathString.relativePathToAbsolutePath(
        PathString.dirPath(Stage.path.getFilePath()),
        entity.portalFilePath,
      );
      const item = {
        key: newKey,
        camera: {
          location: entity.location,
          zoom: entity.cameraScale,
          size: entity.size,
          targetLocation: entity.targetLocation,
        },
      };
      result.push(item);
    }
    return result;
  }

  isEnableEntityCollision: boolean = false;
  isAllowAddCycleEdge: boolean = false;

  constructor(private readonly project: Project) {
    Settings.watch("isEnableEntityCollision", (value) => {
      this.isEnableEntityCollision = value;
    });
    Settings.watch("allowAddCycleEdge", (value) => {
      this.isAllowAddCycleEdge = value;
    });
  }

  isEmpty(): boolean {
    return this.stageContent.entities.length === 0;
  }
  getTextNodes(): TextNode[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof TextNode);
  }
  getConnectableEntity(): ConnectableEntity[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof ConnectableEntity);
  }
  isEntityExists(uuid: string): boolean {
    return this.stageContent.entities.hasId(uuid);
  }
  getSections(): Section[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof Section);
  }
  getImageNodes(): ImageNode[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof ImageNode);
  }
  getConnectPoints(): ConnectPoint[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof ConnectPoint);
  }
  getUrlNodes(): UrlNode[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof UrlNode);
  }
  getPortalNodes(): PortalNode[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof PortalNode);
  }
  getPenStrokes(): PenStroke[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof PenStroke);
  }
  getSvgNodes(): SvgNode[] {
    return this.stageContent.entities.valuesToArray().filter((node) => node instanceof SvgNode);
  }

  getStageObject(): StageObject[] {
    const result: StageObject[] = [];
    result.push(...this.stageContent.entities.valuesToArray());
    result.push(...this.stageContent.associations.valuesToArray());
    return result;
  }

  /**
   * 获取场上所有的实体
   * @returns
   */
  getEntities(): Entity[] {
    return this.stageContent.entities.valuesToArray();
  }
  getStageObjectByUUID(uuid: string): StageObject | null {
    const entity = this.stageContent.entities.getById(uuid);
    if (entity) {
      return entity;
    }
    const association = this.stageContent.associations.getById(uuid);
    if (association) {
      return association;
    }
    return null;
  }
  getEntitiesByUUIDs(uuids: string[]): Entity[] {
    const result = [];
    for (const uuid of uuids) {
      const entity = this.stageContent.entities.getById(uuid);
      if (entity) {
        result.push(entity);
      }
    }
    return result;
  }
  isNoEntity(): boolean {
    return this.stageContent.entities.length === 0;
  }
  deleteOneTextNode(node: TextNode) {
    this.stageContent.entities.deleteValue(node);
  }
  deleteOneImage(node: ImageNode) {
    this.stageContent.entities.deleteValue(node);
  }
  deleteOneUrlNode(node: UrlNode) {
    this.stageContent.entities.deleteValue(node);
  }
  deleteOneSection(section: Section) {
    this.stageContent.entities.deleteValue(section);
  }
  deleteOneConnectPoint(point: ConnectPoint) {
    this.stageContent.entities.deleteValue(point);
  }
  deleteOnePortalNode(node: PortalNode) {
    this.stageContent.entities.deleteValue(node);
  }
  deleteOnePenStroke(penStroke: PenStroke) {
    this.stageContent.entities.deleteValue(penStroke);
  }
  deleteOneEntity(entity: Entity) {
    this.stageContent.entities.deleteValue(entity);
  }
  deleteOneLineEdge(edge: LineEdge) {
    this.stageContent.associations.deleteValue(edge);
  }
  deleteOneAssociation(association: Association) {
    this.stageContent.associations.deleteValue(association);
  }

  getAssociations(): Association[] {
    return this.stageContent.associations.valuesToArray();
  }
  getEdges(): Edge[] {
    return this.stageContent.associations.valuesToArray().filter((edge) => edge instanceof Edge);
  }
  getLineEdges(): LineEdge[] {
    return this.stageContent.associations.valuesToArray().filter((edge) => edge instanceof LineEdge);
  }
  getCrEdges(): CubicCatmullRomSplineEdge[] {
    return this.stageContent.associations.valuesToArray().filter((edge) => edge instanceof CubicCatmullRomSplineEdge);
  }

  /** 关于标签的相关操作 */
  TagOptions = {
    reset: (uuids: string[]) => {
      this.stageContent.tags = [];
      for (const uuid of uuids) {
        this.stageContent.tags.push(uuid);
      }
    },
    addTag: (uuid: string) => {
      this.stageContent.tags.push(uuid);
    },
    removeTag: (uuid: string) => {
      const index = this.stageContent.tags.indexOf(uuid);
      if (index !== -1) {
        this.stageContent.tags.splice(index, 1);
      }
    },
    hasTag: (uuid: string): boolean => {
      return this.stageContent.tags.includes(uuid);
    },
    getTagUUIDs: (): string[] => {
      return this.stageContent.tags;
    },

    /**
     * 清理未引用的标签
     */
    updateTags: () => {
      const uuids = this.stageContent.tags.slice();
      for (const uuid of uuids) {
        if (!this.stageContent.entities.hasId(uuid) && !this.stageContent.associations.hasId(uuid)) {
          this.stageContent.tags.splice(this.stageContent.tags.indexOf(uuid), 1);
        }
      }
    },

    moveUpTag: (uuid: string) => {
      const index = this.stageContent.tags.indexOf(uuid);
      if (index !== -1 && index > 0) {
        const temp = this.stageContent.tags[index - 1];
        this.stageContent.tags[index - 1] = uuid;
        this.stageContent.tags[index] = temp;
        console.log("move up tag");
      }
    },
    moveDownTag: (uuid: string) => {
      const index = this.stageContent.tags.indexOf(uuid);
      if (index !== -1 && index < this.stageContent.tags.length - 1) {
        const temp = this.stageContent.tags[index + 1];
        this.stageContent.tags[index + 1] = uuid;
        this.stageContent.tags[index] = temp;
        console.log("move down tag");
      }
    },
  };

  /**
   * 销毁函数
   * 以防开发过程中造成多开
   */
  destroy() {
    this.stageContent.entities.clear();
    this.stageContent.associations.clear();
    this.stageContent.tags = [];
  }

  addTextNode(node: TextNode) {
    this.stageContent.entities.addValue(node, node.uuid);
  }
  addUrlNode(node: UrlNode) {
    this.stageContent.entities.addValue(node, node.uuid);
  }
  addImageNode(node: ImageNode) {
    this.stageContent.entities.addValue(node, node.uuid);
  }
  addSection(section: Section) {
    this.stageContent.entities.addValue(section, section.uuid);
  }
  addConnectPoint(point: ConnectPoint) {
    this.stageContent.entities.addValue(point, point.uuid);
  }
  addAssociation(association: Association) {
    this.stageContent.associations.addValue(association, association.uuid);
  }
  addLineEdge(edge: LineEdge) {
    this.stageContent.associations.addValue(edge, edge.uuid);
  }
  addCrEdge(edge: CubicCatmullRomSplineEdge) {
    this.stageContent.associations.addValue(edge, edge.uuid);
  }
  addPenStroke(penStroke: PenStroke) {
    this.stageContent.entities.addValue(penStroke, penStroke.uuid);
  }
  addPortalNode(portalNode: PortalNode) {
    this.stageContent.entities.addValue(portalNode, portalNode.uuid);
  }

  addEntity(entity: Entity) {
    this.stageContent.entities.addValue(entity, entity.uuid);
  }

  /**
   * 更新节点的引用，将unknown的节点替换为真实的节点，保证对象在内存中的唯一性
   * 节点什么情况下会是unknown的？
   *
   * 包含了对Section框的更新
   * 包含了对Edge双向线偏移状态的更新
   */
  updateReferences() {
    for (const entity of this.getEntities()) {
      // 实体是可连接类型
      if (entity instanceof ConnectableEntity) {
        for (const edge of this.getAssociations()) {
          if (edge instanceof Edge) {
            if (edge.source.unknown && edge.source.uuid === entity.uuid) {
              edge.source = entity;
            }
            if (edge.target.unknown && edge.target.uuid === entity.uuid) {
              edge.target = entity;
            }
          }
        }
      }
    }
    // 以下是Section框的更新，y值降序排序，从下往上排序，因为下面的往往是内层的Section
    for (const section of this.getSections().sort(
      (a, b) => b.collisionBox.getRectangle().location.y - a.collisionBox.getRectangle().location.y,
    )) {
      // 更新孩子数组，并调整位置和大小
      const newChildList = [];

      for (const childUUID of section.childrenUUIDs) {
        if (this.stageContent.entities.hasId(childUUID)) {
          const childObject = this.stageContent.entities.getById(childUUID);
          if (childObject) {
            newChildList.push(childObject);
          }
        }
      }
      section.children = newChildList;
      section.adjustLocationAndSize();
      section.adjustChildrenStateByCollapse();
    }

    // 以下是LineEdge双向线偏移状态的更新
    for (const edge of this.getLineEdges()) {
      let isShifting = false;
      for (const otherEdge of this.getLineEdges()) {
        if (edge.source === otherEdge.target && edge.target === otherEdge.source) {
          isShifting = true;
          break;
        }
      }
      edge.isShifting = isShifting;
    }

    // 对tags进行更新
    this.TagOptions.updateTags();
  }

  getTextNodeByUUID(uuid: string): TextNode | null {
    for (const node of this.getTextNodes()) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }
  getConnectableEntityByUUID(uuid: string): ConnectableEntity | null {
    for (const node of this.getConnectableEntity()) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }
  isSectionByUUID(uuid: string): boolean {
    return this.stageContent.entities.getById(uuid) instanceof Section;
  }
  getSectionByUUID(uuid: string): Section | null {
    const entity = this.stageContent.entities.getById(uuid);
    if (entity instanceof Section) {
      return entity;
    }
    return null;
  }

  /**
   * 计算所有节点的中心点
   */
  getCenter(): Vector {
    if (this.stageContent.entities.length === 0) {
      return Vector.getZero();
    }
    const allNodesRectangle = Rectangle.getBoundingRectangle(
      this.stageContent.entities.valuesToArray().map((node) => node.collisionBox.getRectangle()),
    );
    return allNodesRectangle.center;
  }

  /**
   * 计算所有节点的大小
   */
  getSize(): Vector {
    if (this.stageContent.entities.length === 0) {
      return new Vector(this.project.renderer.w, this.project.renderer.h);
    }
    const size = this.getBoundingRectangle().size;

    return size;
  }

  /**
   * 获取舞台的矩形对象
   */
  getBoundingRectangle(): Rectangle {
    const rect = Rectangle.getBoundingRectangle(
      Array.from(this.stageContent.entities.valuesToArray()).map((node) => node.collisionBox.getRectangle()),
    );

    return rect;
  }

  /**
   * 根据位置查找节点，常用于点击事件
   * @param location
   * @returns
   */
  findTextNodeByLocation(location: Vector): TextNode | null {
    for (const node of this.getTextNodes()) {
      if (node.collisionBox.isContainsPoint(location)) {
        return node;
      }
    }
    return null;
  }

  /**
   * 用于鼠标悬停时查找边
   * @param location
   * @returns
   */
  findLineEdgeByLocation(location: Vector): LineEdge | null {
    for (const edge of this.getLineEdges()) {
      if (edge.collisionBox.isContainsPoint(location)) {
        return edge;
      }
    }
    return null;
  }

  findAssociationByLocation(location: Vector): Association | null {
    for (const association of this.getAssociations()) {
      if (association.collisionBox.isContainsPoint(location)) {
        return association;
      }
    }
    return null;
  }

  findSectionByLocation(location: Vector): Section | null {
    for (const section of this.getSections()) {
      if (section.collisionBox.isContainsPoint(location)) {
        return section;
      }
    }
    return null;
  }

  findImageNodeByLocation(location: Vector): ImageNode | null {
    for (const node of this.getImageNodes()) {
      if (node.collisionBox.isContainsPoint(location)) {
        return node;
      }
    }
    return null;
  }

  findConnectableEntityByLocation(location: Vector): ConnectableEntity | null {
    for (const entity of this.getConnectableEntity()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * 优先级：
   * 涂鸦 > 其他
   * @param location
   * @returns
   */
  findEntityByLocation(location: Vector): Entity | null {
    for (const penStroke of this.getPenStrokes()) {
      if (penStroke.isHiddenBySectionCollapse) continue;
      if (penStroke.collisionBox.isContainsPoint(location)) {
        return penStroke;
      }
    }
    for (const entity of this.getEntities()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return entity;
      }
    }
    return null;
  }

  findConnectPointByLocation(location: Vector): ConnectPoint | null {
    for (const point of this.getConnectPoints()) {
      if (point.isHiddenBySectionCollapse) {
        continue;
      }
      if (point.collisionBox.isContainsPoint(location)) {
        return point;
      }
    }
    return null;
  }
  isHaveEntitySelected(): boolean {
    for (const entity of this.getEntities()) {
      if (entity.isSelected) {
        return true;
      }
    }
    return false;
  }

  /**
   * O(n)
   * @returns
   */
  getSelectedEntities(): Entity[] {
    return this.stageContent.entities.valuesToArray().filter((entity) => entity.isSelected);
  }
  getSelectedAssociations(): Association[] {
    return this.stageContent.associations.valuesToArray().filter((association) => association.isSelected);
  }
  getSelectedStageObjects(): StageObject[] {
    const result: StageObject[] = [];
    result.push(...this.getSelectedEntities());
    result.push(...this.getSelectedAssociations());
    return result;
  }

  /**
   * 判断某一点是否有实体存在（排除实体的被Section折叠）
   * @param location
   * @returns
   */
  isEntityOnLocation(location: Vector): boolean {
    for (const entity of this.getEntities()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return true;
      }
    }
    return false;
  }
  isAssociationOnLocation(location: Vector): boolean {
    for (const association of this.getAssociations()) {
      if (association instanceof Edge) {
        if (association.target.isHiddenBySectionCollapse && association.source.isHiddenBySectionCollapse) {
          continue;
        }
      }
      if (association.collisionBox.isContainsPoint(location)) {
        return true;
      }
    }
    return false;
  }

  // region 以下为舞台操作相关的函数
  // 建议不同的功能分类到具体的文件中，然后最后集中到这里调用，使得下面的显示简短一些
  // 每个操作函数尾部都要加一个记录历史的操作

  deleteEntities(deleteNodes: Entity[]) {
    this.project.deleteManager.deleteEntities(deleteNodes);
    StageHistoryManager.recordStep();
    // 更新选中节点计数
    this.project.stageObjectSelectCounter.update();
  }

  /**
   * 外部的交互层的delete键可以直接调用这个函数
   */
  deleteSelectedStageObjects() {
    const selectedEntities = this.getEntities().filter((node) => node.isSelected);
    for (const entity of selectedEntities) {
      if (entity instanceof PenStroke) {
        this.project.effects.addEffect(PenStrokeDeletedEffect.fromPenStroke(entity));
      } else {
        this.project.effects.addEffect(EntityShrinkEffect.fromEntity(entity));
      }
    }
    this.deleteEntities(selectedEntities);

    for (const edge of this.getEdges()) {
      if (edge.isSelected) {
        this.deleteEdge(edge);
        this.project.effects.addEffects(this.project.edgeRenderer.getCuttingEffects(edge));
      }
    }
  }
  deleteAssociation(deleteAssociation: Association): boolean {
    if (deleteAssociation instanceof Edge) {
      return this.deleteEdge(deleteAssociation);
    } else if (deleteAssociation instanceof MultiTargetUndirectedEdge) {
      const res = this.project.deleteManager.deleteMultiTargetUndirectedEdge(deleteAssociation);
      StageHistoryManager.recordStep();
      // 更新选中边计数
      this.project.stageObjectSelectCounter.update();
      return res;
    }
    this.project.effects.addEffect(TextRiseEffect.default("无法删除未知类型的关系"));
    return false;
  }

  deleteEdge(deleteEdge: Edge): boolean {
    const res = this.project.deleteManager.deleteEdge(deleteEdge);
    StageHistoryManager.recordStep();
    // 更新选中边计数
    this.project.stageObjectSelectCounter.update();
    return res;
  }

  connectEntity(fromNode: ConnectableEntity, toNode: ConnectableEntity, isCrEdge: boolean = false) {
    if (fromNode === toNode && !this.isAllowAddCycleEdge) {
      return false;
    }
    if (isCrEdge) {
      this.project.nodeConnector.addCrEdge(fromNode, toNode);
    } else {
      this.project.nodeConnector.connectConnectableEntity(fromNode, toNode);
    }

    StageHistoryManager.recordStep();
    return GraphMethods.isConnected(fromNode, toNode);
  }

  /**
   * 多重连接，只记录一次历史
   * @param fromNodes
   * @param toNode
   * @param isCrEdge
   * @returns
   */
  connectMultipleEntities(
    fromNodes: ConnectableEntity[],
    toNode: ConnectableEntity,
    isCrEdge: boolean = false,
    sourceRectRate?: [number, number],
    targetRectRate?: [number, number],
  ) {
    if (fromNodes.length === 0) {
      return false;
    }
    for (const fromNode of fromNodes) {
      if (fromNode === toNode && !this.isAllowAddCycleEdge) {
        continue;
      }
      if (isCrEdge) {
        this.project.nodeConnector.addCrEdge(fromNode, toNode);
      } else {
        this.project.nodeConnector.connectConnectableEntity(fromNode, toNode, "", targetRectRate, sourceRectRate);
      }
    }
    StageHistoryManager.recordStep();
    return true;
  }

  /**
   * 反转一个节点与他相连的所有连线方向
   * @param connectEntity
   */
  private reverseNodeEdges(connectEntity: ConnectableEntity) {
    const prepareReverseEdges = [];
    for (const edge of this.getLineEdges()) {
      if (edge.target === connectEntity || edge.source === connectEntity) {
        prepareReverseEdges.push(edge);
      }
    }
    this.project.nodeConnector.reverseEdges(prepareReverseEdges);
  }

  /**
   * 反转所有选中的节点的每个节点的连线
   */
  reverseSelectedNodeEdge() {
    const entities = this.getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
    for (const entity of entities) {
      this.reverseNodeEdges(entity);
    }
  }

  reverseSelectedEdges() {
    const selectedEdges = this.getLineEdges().filter((edge) => edge.isSelected);
    if (selectedEdges.length === 0) {
      return;
    }
    this.project.nodeConnector.reverseEdges(selectedEdges);
  }

  addSerializedData(serializedData: Serialized.File, diffLocation = new Vector(0, 0)) {
    this.project.serializedDataAdder.addSerializedData(serializedData, diffLocation);
    StageHistoryManager.recordStep();
  }

  generateNodeTreeByText(text: string, indention: number = 4, location = this.project.camera.location) {
    this.project.nodeAdder.addNodeTreeByText(text, indention, location);
    StageHistoryManager.recordStep();
  }

  generateNodeGraphByText(text: string, location = this.project.camera.location) {
    this.project.nodeAdder.addNodeGraphByText(text, location);
    StageHistoryManager.recordStep();
  }

  generateNodeByMarkdown(text: string, location = this.project.camera.location) {
    this.project.nodeAdder.addNodeByMarkdown(text, location);
    StageHistoryManager.recordStep();
  }

  /** 将多个实体打包成一个section，并添加到舞台中 */
  async packEntityToSection(addEntities: Entity[]) {
    await this.project.sectionPackManager.packEntityToSection(addEntities);
    StageHistoryManager.recordStep();
  }

  /** 将选中的实体打包成一个section，并添加到舞台中 */
  async packEntityToSectionBySelected() {
    const selectedNodes = this.getSelectedEntities();
    if (selectedNodes.length === 0) {
      return;
    }
    this.packEntityToSection(selectedNodes);
  }

  goInSection(entities: Entity[], section: Section) {
    this.project.sectionInOutManager.goInSection(entities, section);
    StageHistoryManager.recordStep();
  }

  goOutSection(entities: Entity[], section: Section) {
    this.project.sectionInOutManager.goOutSection(entities, section);
    StageHistoryManager.recordStep();
  }
  /** 将所有选中的Section折叠起来 */
  packSelectedSection() {
    this.project.sectionPackManager.packSection();
    StageHistoryManager.recordStep();
  }

  /** 将所有选中的Section展开 */
  unpackSelectedSection() {
    this.project.sectionPackManager.unpackSection();
    StageHistoryManager.recordStep();
  }

  /**
   * 切换选中的Section的折叠状态
   */
  sectionSwitchCollapse() {
    this.project.sectionPackManager.switchCollapse();
    StageHistoryManager.recordStep();
  }

  addTagBySelected() {
    this.project.tagManager.changeTagBySelected();
  }

  refreshTags() {
    return this.project.tagManager.refreshTagNamesUI();
  }

  moveCameraToTag(tag: string) {
    this.project.tagManager.moveCameraToTag(tag);
  }
  connectEntityByCrEdge(fromNode: ConnectableEntity, toNode: ConnectableEntity) {
    return this.project.nodeConnector.addCrEdge(fromNode, toNode);
  }

  /**
   * 刷新所有舞台内容
   */
  refreshAllStageObjects() {
    const entities = this.getEntities();
    for (const entity of entities) {
      if (entity instanceof TextNode) {
        if (entity.sizeAdjust === "auto") {
          entity.forceAdjustSizeByText();
        }
      } else if (entity instanceof ImageNode) {
        entity.refresh();
      } else if (entity instanceof Section) {
        entity.adjustLocationAndSize();
      }
    }
  }

  /**
   * 刷新选中内容
   */
  refreshSelected() {
    const entities = this.getSelectedEntities();
    for (const entity of entities) {
      if (entity instanceof ImageNode) {
        entity.refresh();
      }
    }
  }

  /**
   * 改变连线的目标接头点位置
   * @param direction
   */
  changeSelectedEdgeConnectLocation(direction: Direction | null, isSource: boolean = false) {
    const edges = this.getSelectedAssociations().filter((edge) => edge instanceof Edge);
    this.changeEdgesConnectLocation(edges, direction, isSource);
  }

  /**
   * 更改多个连线的目标接头点位置
   * @param edges
   * @param direction
   * @param isSource
   */
  changeEdgesConnectLocation(edges: Edge[], direction: Direction | null, isSource: boolean = false) {
    const newLocationRate = new Vector(0.5, 0.5);
    if (direction === Direction.Left) {
      newLocationRate.x = 0.01;
    } else if (direction === Direction.Right) {
      newLocationRate.x = 0.99;
    } else if (direction === Direction.Up) {
      newLocationRate.y = 0.01;
    } else if (direction === Direction.Down) {
      newLocationRate.y = 0.99;
    }

    for (const edge of edges) {
      if (isSource) {
        edge.setSourceRectangleRate(newLocationRate);
      } else {
        edge.setTargetRectangleRate(newLocationRate);
      }
    }
  }

  switchLineEdgeToCrEdge() {
    const prepareDeleteLineEdge: LineEdge[] = [];
    for (const edge of this.getLineEdges()) {
      if (edge instanceof LineEdge && edge.isSelected) {
        // 删除这个连线，并准备创建cr曲线
        prepareDeleteLineEdge.push(edge);
      }
    }
    for (const lineEdge of prepareDeleteLineEdge) {
      this.deleteEdge(lineEdge);
      this.connectEntityByCrEdge(lineEdge.source, lineEdge.target);
    }
  }

  /**
   * 有向边转无向边
   */
  switchEdgeToUndirectedEdge() {
    const prepareDeleteLineEdge: LineEdge[] = [];
    for (const edge of this.getLineEdges()) {
      if (edge instanceof LineEdge && edge.isSelected) {
        // 删除这个连线，并准备创建
        prepareDeleteLineEdge.push(edge);
      }
    }
    for (const edge of prepareDeleteLineEdge) {
      if (edge.target === edge.source) {
        continue;
      }
      this.deleteEdge(edge);
      const undirectedEdge = MultiTargetUndirectedEdge.createFromSomeEntity([edge.target, edge.source]);
      undirectedEdge.text = edge.text;
      undirectedEdge.color = edge.color.clone();
      undirectedEdge.arrow = "outer";
      // undirectedEdge.isSelected = true;
      this.addAssociation(undirectedEdge);
    }
    this.project.stageObjectSelectCounter.update();
  }
  /**
   * 无向边转有向边
   */
  switchUndirectedEdgeToEdge() {
    const prepareDeleteUndirectedEdge: MultiTargetUndirectedEdge[] = [];
    for (const edge of this.getAssociations()) {
      if (edge instanceof MultiTargetUndirectedEdge && edge.isSelected) {
        // 删除这个连线，并准备创建
        prepareDeleteUndirectedEdge.push(edge);
      }
    }
    for (const edge of prepareDeleteUndirectedEdge) {
      if (edge.targetUUIDs.length !== 2) {
        continue;
      }

      const [fromNode, toNode] = this.getEntitiesByUUIDs(edge.targetUUIDs);
      if (fromNode && toNode && fromNode instanceof ConnectableEntity && toNode instanceof ConnectableEntity) {
        const lineEdge = LineEdge.fromTwoEntity(fromNode, toNode);
        lineEdge.text = edge.text;
        lineEdge.color = edge.color.clone();
        this.deleteAssociation(edge);
        this.addLineEdge(lineEdge);
        this.updateReferences();
      }
    }
  }

  addSelectedCREdgeControlPoint() {
    const selectedCREdge = this.getSelectedAssociations().filter((edge) => edge instanceof CubicCatmullRomSplineEdge);
    for (const edge of selectedCREdge) {
      edge.addControlPoint();
    }
  }

  addSelectedCREdgeTension() {
    const selectedCREdge = this.getSelectedAssociations().filter((edge) => edge instanceof CubicCatmullRomSplineEdge);
    for (const edge of selectedCREdge) {
      edge.tension += 0.25;
      edge.tension = Math.min(1, edge.tension);
    }
  }

  reduceSelectedCREdgeTension() {
    const selectedCREdge = this.getSelectedAssociations().filter((edge) => edge instanceof CubicCatmullRomSplineEdge);
    for (const edge of selectedCREdge) {
      edge.tension -= 0.25;
      edge.tension = Math.max(0, edge.tension);
    }
  }

  /**
   * ctrl + A 全选
   */
  selectAll() {
    const allEntity = this.stageContent.entities.valuesToArray();
    for (const entity of allEntity) {
      entity.isSelected = true;
    }
    const associations = this.stageContent.associations.valuesToArray();
    this.project.effects.addEffect(TextRiseEffect.default(`${allEntity.length}个实体，${associations.length}个关系`));
  }
  clearSelectAll() {
    for (const entity of this.stageContent.entities.valuesToArray()) {
      entity.isSelected = false;
    }
    for (const edge of this.stageContent.associations.valuesToArray()) {
      edge.isSelected = false;
    }
  }

  addPortalNodeToStage(otherPath: string) {
    const uuid = v4();
    const relativePath = PathString.getRelativePath(Stage.path.getFilePath(), otherPath);
    if (relativePath === "") {
      return false;
    }
    this.stageContent.entities.addValue(
      new PortalNode({
        uuid: uuid,
        title: PathString.dirPath(otherPath),
        portalFilePath: relativePath,
        location: [this.project.camera.location.x, this.project.camera.location.y],
        size: [500, 500],
        cameraScale: 1,
      }),
      uuid,
    );
    StageHistoryManager.recordStep();
    return true;
  }
}
