import { Color } from "../../dataStruct/Color";
import { Edge } from "../../stageObject/association/Edge";
import { TextNode } from "../../stageObject/entity/TextNode";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { StageNodeRotate } from "./concreteMethods/stageNodeRotate";
import { StageNodeAdder } from "./concreteMethods/stageNodeAdder";
import { StageDeleteManager } from "./concreteMethods/StageDeleteManager";
import { StageNodeConnector } from "./concreteMethods/StageNodeConnector";
import { StageEntityMoveManager } from "./concreteMethods/StageEntityMoveManager";
import { StageNodeColorManager } from "./concreteMethods/StageNodeColorManager";
import { Serialized } from "../../../types/node";
import { StageSerializedAdder } from "./concreteMethods/StageSerializedAdder";
import { StageHistoryManager } from "./concreteMethods/StageHistoryManager";
import { Stage } from "../Stage";
import { StageDumper } from "../StageDumper";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { StringDict } from "../../dataStruct/StringDict";
import {
  Association,
  ConnectableEntity,
  Entity,
  StageObject,
} from "../../stageObject/StageObject";
import { Section } from "../../stageObject/entity/Section";
import { StageSectionInOutManager } from "./concreteMethods/StageSectionInOutManager";
import { Camera } from "../Camera";
import { StageSectionPackManager } from "./concreteMethods/StageSectionPackManager";
import { StageNodeTextTransfer } from "./concreteMethods/StageNodeTextTransfer";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例

/**
 * 舞台管理器，也可以看成包含了很多操作方法的《舞台实体容器》
 * 管理节点、边的关系等，内部包含了舞台上的所有实体
 */
export namespace StageManager {
  const entities: StringDict<Entity> = StringDict.create();
  const associations: StringDict<Association> = StringDict.create();

  export function getTextNodes(): TextNode[] {
    return entities.valuesToArray().filter((node) => node instanceof TextNode);
  }
  export function getConnectableEntity(): ConnectableEntity[] {
    return entities
      .valuesToArray()
      .filter((node) => node instanceof ConnectableEntity);
  }
  export function isEntityExists(uuid: string): boolean {
    return entities.hasId(uuid);
  }
  export function getSections(): Section[] {
    return entities.valuesToArray().filter((node) => node instanceof Section);
  }
  export function getConnectPoints(): ConnectPoint[] {
    return entities
      .valuesToArray()
      .filter((node) => node instanceof ConnectPoint);
  }

  export function getStageObject(): StageObject[] {
    const result: StageObject[] = [];
    result.push(...entities.valuesToArray());
    result.push(...associations.valuesToArray());
    return result;
  }

  export function getEntities(): Entity[] {
    return entities.valuesToArray();
  }
  export function getEntitiesByUUIDs(uuids: string[]): Entity[] {
    const result = [];
    for (const uuid of uuids) {
      const entity = entities.getById(uuid);
      if (entity) {
        result.push(entity);
      }
    }
    return result;
  }
  export function isNoEntity(): boolean {
    return entities.length === 0;
  }
  export function deleteOneTextNode(node: TextNode) {
    entities.deleteValue(node);
  }
  export function deleteOneSection(section: Section) {
    entities.deleteValue(section);
  }
  export function deleteOneConnectPoint(point: ConnectPoint) {
    entities.deleteValue(point);
  }
  export function deleteOneEdge(edge: Edge) {
    associations.deleteValue(edge);
  }

  export function getAssociations(): Association[] {
    return associations.valuesToArray();
  }

  export function getEdges(): Edge[] {
    return associations.valuesToArray().filter((edge) => edge instanceof Edge);
  }

  /**
   * 销毁函数
   * 以防开发过程中造成多开
   */
  export function destroy() {
    entities.clear();
    associations.clear();
  }

  export function addTextNode(node: TextNode) {
    entities.addValue(node, node.uuid);
  }
  export function addSection(section: Section) {
    entities.addValue(section, section.uuid);
  }
  export function addConnectPoint(point: ConnectPoint) {
    entities.addValue(point, point.uuid);
  }
  export function addEdge(edge: Edge) {
    associations.addValue(edge, edge.uuid);
  }

  // 用于UI层监测
  export let selectedNodeCount = 0;
  export let selectedEdgeCount = 0;

  /** 获取节点连接的子节点数组 */
  export function nodeChildrenArray(
    node: ConnectableEntity,
  ): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of getEdges()) {
      if (edge.source.uuid === node.uuid) {
        res.push(edge.target);
      }
    }
    return res;
  }

  function isConnected(
    node: ConnectableEntity,
    target: ConnectableEntity,
  ): boolean {
    for (const edge of getEdges()) {
      if (edge.source === node && edge.target === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * 更新节点的引用，将unknown的节点替换为真实的节点，保证对象在内存中的唯一性
   * 节点什么情况下会是unknown的？
   *
   * 包含了对Section框的更新
   *
   */
  export function updateReferences() {
    for (const entity of getEntities()) {
      if (entity instanceof ConnectableEntity) {
        for (const edge of getEdges()) {
          if (edge.source.unknown && edge.source.uuid === entity.uuid) {
            edge.source = entity;
          }
          if (edge.target.unknown && edge.target.uuid === entity.uuid) {
            edge.target = entity;
          }
        }
      }

      if (entity instanceof Section) {
        const newChildList = [];

        for (const child of entity.children) {
          if (entities.hasId(child.uuid)) {
            const childObject = entities.getById(child.uuid);
            if (childObject) {
              newChildList.push(childObject);
            }
          }
        }
        entity.children = newChildList;
        entity.adjustLocationAndSize();
      }
    }
  }

  export function getTextNodeByUUID(uuid: string): TextNode | null {
    for (const node of getTextNodes()) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }
  export function getConnectableEntityByUUID(
    uuid: string,
  ): ConnectableEntity | null {
    for (const node of getConnectableEntity()) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }
  export function isSectionByUUID(uuid: string): boolean {
    return entities.getById(uuid) instanceof Section;
  }
  export function getSectionByUUID(uuid: string): Section | null {
    const entity = entities.getById(uuid);
    if (entity instanceof Section) {
      return entity;
    }
    return null;
  }

  /**
   * 计算所有节点的中心点
   */
  export function getCenter(): Vector {
    if (entities.length === 0) {
      return Vector.getZero();
    }
    const allNodesRectangle = Rectangle.getBoundingRectangle(
      entities.valuesToArray().map((node) => node.collisionBox.getRectangle()),
    );
    return allNodesRectangle.center;
  }

  /**
   * 计算所有节点的大小
   */
  export function getSize(): Vector {
    if (entities.length === 0) {
      console.log("获取所有节点大小时没有节点");
      return new Vector(Renderer.w, Renderer.h);
    }
    // const size = Vector.getZero();
    // for (const node of getEntities()) {
    //   if (node.collisionBox.getRectangle().size.x > size.x) {
    //     size.x = node.collisionBox.getRectangle().size.x;
    //   }
    //   if (node.collisionBox.getRectangle().size.y > size.y) {
    //     size.y = node.collisionBox.getRectangle().size.y;
    //   }
    // }
    // return size;
    const size = Rectangle.getBoundingRectangle(
      Array.from(entities.valuesToArray()).map((node) =>
        node.collisionBox.getRectangle(),
      ),
    ).size;
    console.log(size, "getSize");
    return size;
  }

  /**
   * 根据位置查找节点，常用于点击事件
   * @param location
   * @returns
   */
  export function findTextNodeByLocation(location: Vector): TextNode | null {
    for (const node of getTextNodes()) {
      if (node.collisionBox.isPointInCollisionBox(location)) {
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
  export function findEdgeByLocation(location: Vector): Edge | null {
    for (const edge of getEdges()) {
      if (edge.collisionBox.isPointInCollisionBox(location)) {
        return edge;
      }
    }
    return null;
  }

  export function findSectionByLocation(location: Vector): Section | null {
    for (const section of getSections()) {
      if (section.collisionBox.isPointInCollisionBox(location)) {
        return section;
      }
    }
    return null;
  }

  export function findConnectableEntityByLocation(
    location: Vector,
  ): ConnectableEntity | null {
    for (const entity of getConnectableEntity()) {
      if (entity.collisionBox.isPointInCollisionBox(location)) {
        return entity;
      }
    }
    return null;
  }

  export function findConnectPointByLocation(
    location: Vector,
  ): ConnectPoint | null {
    for (const point of getConnectPoints()) {
      if (point.collisionBox.isPointInCollisionBox(location)) {
        return point;
      }
    }
    return null;
  }
  export function isHaveEntitySelected(): boolean {
    for (const entity of getEntities()) {
      if (entity.isSelected) {
        return true;
      }
    }
    return false;
  }
  export function getSelectedEntities(): Entity[] {
    return entities.valuesToArray().filter((entity) => entity.isSelected);
  }

  export function isEntityOnLocation(location: Vector): boolean {
    for (const entity of getEntities()) {
      if (entity.collisionBox.isPointInCollisionBox(location)) {
        return true;
      }
    }
    return false;
  }
  export function isAssociationOnLocation(location: Vector): boolean {
    for (const association of getAssociations()) {
      if (association.collisionBox.isPointInCollisionBox(location)) {
        return true;
      }
    }
    return false;
  }

  // region 以下为舞台操作相关的函数
  // 建议不同的功能分类到具体的文件中，然后最后集中到这里调用，使得下面的显示简短一些
  // 每个操作函数尾部都要加一个记录历史的操作

  /**
   *
   * @param clickWorldLocation
   * @returns 返回新创建节点的uuid
   */
  export async function addTextNodeByClick(
    clickWorldLocation: Vector,
  ): Promise<string> {
    const res = await StageNodeAdder.addTextNodeByClick(clickWorldLocation);
    StageHistoryManager.recordStep();
    return res;
  }

  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveNodes(delta: Vector) {
    StageEntityMoveManager.moveNodes(delta); // 连续过程，不记录历史，只在结束时记录
  }

  export function moveSections(delta: Vector) {
    StageEntityMoveManager.moveSections(delta); // 连续过程，不记录历史，只在结束时记录
  }
  export function moveConnectPoints(delta: Vector) {
    StageEntityMoveManager.moveConnectPoints(delta); // 连续过程，不记录历史，只在结束时记录
  }
  export function moveNodesWithChildren(delta: Vector) {
    StageEntityMoveManager.moveNodesWithChildren(delta); // 连续过程，不记录历史，只在结束时记录
  }

  export function alignLeft() {
    StageEntityMoveManager.alignLeft();
    StageHistoryManager.recordStep();
  }

  export function alignRight() {
    StageEntityMoveManager.alignRight();
    StageHistoryManager.recordStep();
  }

  export function alignTop() {
    StageEntityMoveManager.alignTop();
    StageHistoryManager.recordStep();
  }
  export function alignBottom() {
    StageEntityMoveManager.alignBottom();
    StageHistoryManager.recordStep();
  }
  export function alignCenterHorizontal() {
    StageEntityMoveManager.alignCenterHorizontal();
    StageHistoryManager.recordStep();
  }
  export function alignCenterVertical() {
    StageEntityMoveManager.alignCenterVertical();
    StageHistoryManager.recordStep();
  }
  export function alignHorizontalSpaceBetween() {
    StageEntityMoveManager.alignHorizontalSpaceBetween();
    StageHistoryManager.recordStep();
  }
  export function alignVerticalSpaceBetween() {
    StageEntityMoveManager.alignVerticalSpaceBetween();
    StageHistoryManager.recordStep();
  }

  export function setNodeColor(color: Color) {
    StageNodeColorManager.setNodeColor(color);
    StageHistoryManager.recordStep();
  }

  export function clearNodeColor() {
    StageNodeColorManager.clearNodeColor();
    StageHistoryManager.recordStep();
  }

  export function moveEntityFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
    StageHistoryManager.recordStep();
  }

  export function moveEdgeFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
    StageHistoryManager.recordStep();
  }

  /**
   * 通过拖拽边的方式来旋转节点
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    StageNodeRotate.moveEdges(lastMoveLocation, diffLocation); // 连续过程，不记录历史，只在结束时记录
  }

  /**
   * 单独对一个节点，滚轮旋转
   * @param node
   * @param angle
   */
  export function rotateNode(node: TextNode, angle: number) {
    StageNodeRotate.rotateNodeDfs(node, node, angle, []); // 连续过程，不记录历史，只在结束时记录
    updateReferences();
  }

  export function deleteEntities(deleteNodes: Entity[]) {
    StageDeleteManager.deleteEntities(deleteNodes);
    StageHistoryManager.recordStep();
    // 更新选中节点计数
    selectedNodeCount = 0;
    for (const node of entities.valuesToArray()) {
      if (node.isSelected) {
        selectedNodeCount++;
      }
    }
  }

  export function deleteEdge(deleteEdge: Edge): boolean {
    const res = StageDeleteManager.deleteEdge(deleteEdge);
    StageHistoryManager.recordStep();
    // 更新选中边计数
    selectedEdgeCount = 0;
    for (const edge of associations.valuesToArray()) {
      if (edge.isSelected) {
        selectedEdgeCount++;
      }
    }
    return res;
  }

  export function deleteSection(section: Section) {
    StageDeleteManager.deleteEntities([section]);
    StageHistoryManager.recordStep();
  }

  export function connectEntity(
    fromNode: ConnectableEntity,
    toNode: ConnectableEntity,
  ) {
    StageNodeConnector.connectConnectableEntity(fromNode, toNode);
    StageHistoryManager.recordStep();
    return isConnected(fromNode, toNode);
  }

  export function reverseEdges(edges: Edge[]) {
    StageNodeConnector.reverseEdges(edges);
    StageHistoryManager.recordStep();
  }

  export function addSerializedData(
    serializedData: Serialized.File,
    diffLocation = new Vector(0, 0),
  ) {
    StageSerializedAdder.addSerializedData(serializedData, diffLocation);
    StageHistoryManager.recordStep();
  }

  export function clearClipboard() {
    Stage.copyBoardData = {
      version: StageDumper.latestVersion,
      nodes: [],
      edges: [],
    };
  }

  export function generateNodeByText(
    text: string,
    indention: number = 4,
    location = Camera.location,
  ) {
    StageNodeAdder.addNodeByText(text, indention, location);
    StageHistoryManager.recordStep();
  }

  /** 将多个实体打包成一个section，并添加到舞台中 */
  export function packEntityToSection(addEntities: Entity[]) {
    const section = Section.fromEntities(addEntities);
    entities.addValue(section, section.uuid);
    StageHistoryManager.recordStep();
  }

  export function goInSection(entities: Entity[], section: Section) {
    StageSectionInOutManager.goInSection(entities, section);
    StageHistoryManager.recordStep();
  }

  export function goOutSection(entities: Entity[], section: Section) {
    StageSectionInOutManager.goOutSection(entities, section);
    StageHistoryManager.recordStep();
  }
  /** 将所有选中的Section展开 */
  export function packSelectedSection() {
    StageSectionPackManager.packSection();
    StageHistoryManager.recordStep();
  }

  /** 将所有选中的Section收起 */
  export function unpackSelectedSection() {
    StageSectionPackManager.unpackSection();
    StageHistoryManager.recordStep();
  }

  export function calculateSelectedNode() {
    StageNodeTextTransfer.calculateAllSelected();
    StageHistoryManager.recordStep();
  }

  export function addConnectPointByClick(location: Vector) {
    StageNodeAdder.addConnectPoint(location);
    StageHistoryManager.recordStep();
  }
}
