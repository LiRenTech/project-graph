import { Serialized } from "../../../types/node";
import { Color } from "../../dataStruct/Color";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { StringDict } from "../../dataStruct/StringDict";
import { Vector } from "../../dataStruct/Vector";
import { EdgeRenderer } from "../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../render/canvas2d/renderer";
import { Settings } from "../../service/Settings";
import { Camera } from "../Camera";
import { Stage } from "../Stage";
import { Association } from "../stageObject/abstract/Association";
import { ConnectableEntity } from "../stageObject/abstract/ConnectableEntity";
import { Entity } from "../stageObject/abstract/StageEntity";
import { StageObject } from "../stageObject/abstract/StageObject";
import { CublicCatmullRomSplineEdge } from "../stageObject/association/CublicCatmullRomSplineEdge";
import { Edge } from "../stageObject/association/Edge";
import { LineEdge } from "../stageObject/association/LineEdge";
import { ConnectPoint } from "../stageObject/entity/ConnectPoint";
import { ImageNode } from "../stageObject/entity/ImageNode";
import { PenStroke } from "../stageObject/entity/PenStroke";
import { Section } from "../stageObject/entity/Section";
import { TextNode } from "../stageObject/entity/TextNode";
import { UrlNode } from "../stageObject/entity/UrlNode";
import { SectionMethods } from "./basicMethods/SectionMethods";
import { StageAutoAlignManager } from "./concreteMethods/StageAutoAlignManager";
import { StageDeleteManager } from "./concreteMethods/StageDeleteManager";
import { StageEntityMoveManager } from "./concreteMethods/StageEntityMoveManager";
import { StageGeneratorAI } from "./concreteMethods/StageGeneratorAI";
import { StageManagerUtils } from "./concreteMethods/StageManagerUtils";
import { StageNodeAdder } from "./concreteMethods/stageNodeAdder";
import { StageNodeColorManager } from "./concreteMethods/StageNodeColorManager";
import { StageNodeConnector } from "./concreteMethods/StageNodeConnector";
import { StageNodeRotate } from "./concreteMethods/stageNodeRotate";
import { StageNodeTextTransfer } from "./concreteMethods/StageNodeTextTransfer";
import { StageSectionInOutManager } from "./concreteMethods/StageSectionInOutManager";
import { StageSectionPackManager } from "./concreteMethods/StageSectionPackManager";
import { StageSerializedAdder } from "./concreteMethods/StageSerializedAdder";
import { StageTagManager } from "./concreteMethods/StageTagManager";
import { StageHistoryManager } from "./StageHistoryManager";

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
  const tags: StringDict<string> = StringDict.create();

  export let isEnableEntityCollision: boolean = false;
  export let isAllowAddCycleEdge: boolean = false;

  export function init() {
    Settings.watch("isEnableEntityCollision", (value) => {
      isEnableEntityCollision = value;
    });
    Settings.watch("allowAddCycleEdge", (value) => {
      isAllowAddCycleEdge = value;
    });
  }

  export function isEmpty(): boolean {
    return entities.length === 0;
  }
  export function getTextNodes(): TextNode[] {
    return entities.valuesToArray().filter((node) => node instanceof TextNode);
  }
  export function getConnectableEntity(): ConnectableEntity[] {
    return entities.valuesToArray().filter((node) => node instanceof ConnectableEntity);
  }
  export function isEntityExists(uuid: string): boolean {
    return entities.hasId(uuid);
  }
  export function getSections(): Section[] {
    return entities.valuesToArray().filter((node) => node instanceof Section);
  }
  export function getImageNodes(): ImageNode[] {
    return entities.valuesToArray().filter((node) => node instanceof ImageNode);
  }
  export function getConnectPoints(): ConnectPoint[] {
    return entities.valuesToArray().filter((node) => node instanceof ConnectPoint);
  }
  export function getUrlNodes(): UrlNode[] {
    return entities.valuesToArray().filter((node) => node instanceof UrlNode);
  }

  export function getStageObject(): StageObject[] {
    const result: StageObject[] = [];
    result.push(...entities.valuesToArray());
    result.push(...associations.valuesToArray());
    return result;
  }

  /**
   * 获取场上所有的实体
   * @returns
   */
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
  export function deleteOneImage(node: ImageNode) {
    entities.deleteValue(node);
  }
  export function deleteOneUrlNode(node: UrlNode) {
    entities.deleteValue(node);
  }
  export function deleteOneSection(section: Section) {
    entities.deleteValue(section);
  }
  export function deleteOneConnectPoint(point: ConnectPoint) {
    entities.deleteValue(point);
  }
  export function deleteOneEdge(edge: LineEdge) {
    associations.deleteValue(edge);
  }

  export function getAssociations(): Association[] {
    return associations.valuesToArray();
  }

  export function getLineEdges(): LineEdge[] {
    return associations.valuesToArray().filter((edge) => edge instanceof LineEdge);
  }
  export function getCrEdges(): CublicCatmullRomSplineEdge[] {
    return associations.valuesToArray().filter((edge) => edge instanceof CublicCatmullRomSplineEdge);
  }

  /** 关于标签的相关操作 */
  export namespace TagOptions {
    export function reset(uuids: string[]) {
      tags.clear();
      for (const uuid of uuids) {
        tags.addValue(uuid, uuid);
      }
    }
    export function addTag(uuid: string) {
      tags.addValue(uuid, uuid);
    }
    export function removeTag(uuid: string) {
      tags.deleteValue(uuid);
    }
    export function hasTag(uuid: string): boolean {
      return tags.hasId(uuid);
    }
    export function getTagUUIDs(): string[] {
      return tags.valuesToArray();
    }
    // 清理未引用的标签
    export function updateTags() {
      const uuids = tags.valuesToArray();
      for (const uuid of uuids) {
        if (!entities.hasId(uuid)) {
          tags.deleteValue(uuid);
        }
      }
    }
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
  export function addUrlNode(node: UrlNode) {
    entities.addValue(node, node.uuid);
  }
  export function addImageNode(node: ImageNode) {
    entities.addValue(node, node.uuid);
  }
  export function addSection(section: Section) {
    entities.addValue(section, section.uuid);
  }
  export function addConnectPoint(point: ConnectPoint) {
    entities.addValue(point, point.uuid);
  }
  export function addLineEdge(edge: LineEdge) {
    associations.addValue(edge, edge.uuid);
  }
  export function addCrEdge(edge: CublicCatmullRomSplineEdge) {
    associations.addValue(edge, edge.uuid);
  }
  export function addPenStroke(penStroke: PenStroke) {
    entities.addValue(penStroke, penStroke.uuid);
  }

  // 用于UI层监测
  export let selectedNodeCount = 0;
  export let selectedEdgeCount = 0;

  /** 获取节点连接的子节点数组，未排除自环 */
  export function nodeChildrenArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of getLineEdges()) {
      if (edge.source.uuid === node.uuid) {
        res.push(edge.target);
      }
    }
    return res;
  }

  /**
   * 获取一个节点的所有父亲节点，未排除自环
   * 性能有待优化！！
   */
  export function nodeParentArray(node: ConnectableEntity): ConnectableEntity[] {
    const res: ConnectableEntity[] = [];
    for (const edge of getLineEdges()) {
      if (edge.target.uuid === node.uuid) {
        res.push(edge.source);
      }
    }
    return res;
  }

  export function isConnected(node: ConnectableEntity, target: ConnectableEntity): boolean {
    for (const edge of getLineEdges()) {
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
   * 包含了对Edge双向线偏移状态的更新
   */
  export function updateReferences() {
    for (const entity of getEntities()) {
      // 实体是可连接类型
      if (entity instanceof ConnectableEntity) {
        for (const edge of getAssociations()) {
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

      // 以下是Section框的更新
      if (entity instanceof Section) {
        // 更新孩子数组，并调整位置和大小
        const newChildList = [];

        for (const childUUID of entity.childrenUUIDs) {
          if (entities.hasId(childUUID)) {
            const childObject = entities.getById(childUUID);
            if (childObject) {
              newChildList.push(childObject);
            }
          }
        }
        entity.children = newChildList;
        entity.adjustLocationAndSize();
        entity.adjustChildrenStateByCollapse();
      }
    }

    // 以下是LineEdge双向线偏移状态的更新
    for (const edge of getLineEdges()) {
      let isShifting = false;
      for (const otherEdge of getLineEdges()) {
        if (edge.source === otherEdge.target && edge.target === otherEdge.source) {
          isShifting = true;
          break;
        }
      }
      edge.isShifting = isShifting;
    }

    // 对tags进行更新
    TagOptions.updateTags();
  }

  export function getTextNodeByUUID(uuid: string): TextNode | null {
    for (const node of getTextNodes()) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }
  export function getConnectableEntityByUUID(uuid: string): ConnectableEntity | null {
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
      Array.from(entities.valuesToArray()).map((node) => node.collisionBox.getRectangle()),
    ).size;

    return size;
  }

  /**
   * 根据位置查找节点，常用于点击事件
   * @param location
   * @returns
   */
  export function findTextNodeByLocation(location: Vector): TextNode | null {
    for (const node of getTextNodes()) {
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
  export function findEdgeByLocation(location: Vector): LineEdge | null {
    for (const edge of getLineEdges()) {
      if (edge.collisionBox.isContainsPoint(location)) {
        return edge;
      }
    }
    return null;
  }

  export function findSectionByLocation(location: Vector): Section | null {
    for (const section of getSections()) {
      if (section.collisionBox.isContainsPoint(location)) {
        return section;
      }
    }
    return null;
  }

  export function findImageNodeByLocation(location: Vector): ImageNode | null {
    for (const node of getImageNodes()) {
      if (node.collisionBox.isContainsPoint(location)) {
        return node;
      }
    }
    return null;
  }

  export function findConnectableEntityByLocation(location: Vector): ConnectableEntity | null {
    for (const entity of getConnectableEntity()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return entity;
      }
    }
    return null;
  }

  export function findEntityByLocation(location: Vector): Entity | null {
    for (const entity of getEntities()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return entity;
      }
    }
    return null;
  }

  export function findConnectPointByLocation(location: Vector): ConnectPoint | null {
    for (const point of getConnectPoints()) {
      if (point.isHiddenBySectionCollapse) {
        continue;
      }
      if (point.collisionBox.isContainsPoint(location)) {
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

  /**
   * O(n)
   * @returns
   */
  export function getSelectedEntities(): Entity[] {
    return entities.valuesToArray().filter((entity) => entity.isSelected);
  }

  /**
   * 判断某一点是否有实体存在（排除实体的被Section折叠）
   * @param location
   * @returns
   */
  export function isEntityOnLocation(location: Vector): boolean {
    for (const entity of getEntities()) {
      if (entity.isHiddenBySectionCollapse) {
        continue;
      }
      if (entity.collisionBox.isContainsPoint(location)) {
        return true;
      }
    }
    return false;
  }
  export function isAssociationOnLocation(location: Vector): boolean {
    for (const association of getAssociations()) {
      if (association instanceof LineEdge) {
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

  /**
   *
   * @param clickWorldLocation
   * @returns 返回新创建节点的uuid
   */
  export async function addTextNodeByClick(
    clickWorldLocation: Vector,
    addToSections: Section[],
    selectCurrent = false,
  ): Promise<string> {
    const res = await StageNodeAdder.addTextNodeByClick(clickWorldLocation, addToSections, selectCurrent);
    StageHistoryManager.recordStep();
    return res;
  }

  export async function addTextNodeFromCurrentSelectedNode(
    direction: "up" | "down" | "left" | "right",
    selectCurrent = false,
  ): Promise<string> {
    let directionVector = new Vector(0, 0);
    if (direction === "up") {
      directionVector = new Vector(0, -100);
    } else if (direction === "down") {
      directionVector = new Vector(0, 100);
    } else if (direction === "left") {
      directionVector = new Vector(-100, 0);
    } else if (direction === "right") {
      directionVector = new Vector(100, 0);
    }
    const res = await StageNodeAdder.addTextNodeFromCurrentSelectedNode(directionVector, [], selectCurrent);
    StageHistoryManager.recordStep();
    return res;
  }

  export function moveEntities(delta: Vector) {
    StageEntityMoveManager.moveEntities(delta); // 连续过程，不记录历史，只在结束时记录
  }

  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveSelectedNodes(delta: Vector) {
    StageEntityMoveManager.moveSelectedNodes(delta); // 连续过程，不记录历史，只在结束时记录
  }

  export function moveSelectedSections(delta: Vector) {
    StageEntityMoveManager.moveSelectedSections(delta); // 连续过程，不记录历史，只在结束时记录
  }
  export function moveSelectedConnectPoints(delta: Vector) {
    StageEntityMoveManager.moveSelectedConnectPoints(delta); // 连续过程，不记录历史，只在结束时记录
  }
  export function moveSelectedImageNodes(delta: Vector) {
    StageEntityMoveManager.moveSelectedImageNodes(delta); // 连续过程，不记录历史，只在结束时记录
  }
  export function moveSelectedUrlNodes(delta: Vector) {
    StageEntityMoveManager.moveSelectedUrlNodes(delta); // 连续过程，不记录历史，只在结束时记录
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

  export function setEntityColor(color: Color) {
    StageNodeColorManager.setEntityColor(color);
    StageHistoryManager.recordStep();
  }

  export function clearNodeColor() {
    StageNodeColorManager.clearEntityColor();
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

  /**
   * 外部的交互层的delete键可以直接调用这个函数
   */
  export function deleteSelectedStageObjects() {
    StageManager.deleteEntities(StageManager.getEntities().filter((node) => node.isSelected));
    for (const edge of StageManager.getLineEdges()) {
      if (edge.isSelected) {
        StageManager.deleteEdge(edge);
        Stage.effectMachine.addEffects(EdgeRenderer.getCuttingEffects(edge));
      }
    }
  }

  export function deleteEdge(deleteEdge: LineEdge): boolean {
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

  // export function deleteSection(section: Section) {
  //   StageDeleteManager.deleteEntities([section]);
  //   StageHistoryManager.recordStep();
  // }

  export function connectEntity(fromNode: ConnectableEntity, toNode: ConnectableEntity) {
    if (fromNode === toNode && !isAllowAddCycleEdge) {
      return false;
    }
    StageNodeConnector.connectConnectableEntity(fromNode, toNode);
    StageHistoryManager.recordStep();
    return isConnected(fromNode, toNode);
  }

  export function reverseEdges(edges: LineEdge[]) {
    StageNodeConnector.reverseEdges(edges);
    StageHistoryManager.recordStep();
  }

  /**
   * 反转一个节点与他相连的所有连线方向
   * @param connectEntity
   */
  function reverseNodeEdges(connectEntity: ConnectableEntity) {
    const prepareReverseEdges = [];
    for (const edge of getLineEdges()) {
      if (edge.target === connectEntity || edge.source === connectEntity) {
        prepareReverseEdges.push(edge);
      }
    }
    reverseEdges(prepareReverseEdges);
  }

  /**
   * 反转所有选中的节点的每个节点的连线
   */
  export function reverseSelectedNodeEdge() {
    const entities = getSelectedEntities().filter((entity) => entity instanceof ConnectableEntity);
    for (const entity of entities) {
      reverseNodeEdges(entity);
    }
  }

  export function reverseSelectedEdges() {
    const selectedEdges = getLineEdges().filter((edge) => edge.isSelected);
    if (selectedEdges.length === 0) {
      return;
    }
    reverseEdges(selectedEdges);
    StageHistoryManager.recordStep();
  }

  export function addSerializedData(serializedData: Serialized.File, diffLocation = new Vector(0, 0)) {
    StageSerializedAdder.addSerializedData(serializedData, diffLocation);
    StageHistoryManager.recordStep();
  }

  export function generateNodeByText(text: string, indention: number = 4, location = Camera.location) {
    StageNodeAdder.addNodeByText(text, indention, location);
    StageHistoryManager.recordStep();
  }

  export function generateNodeByMarkdown(text: string, location = Camera.location) {
    StageNodeAdder.addNodeByMarkdown(text, location);
    StageHistoryManager.recordStep();
  }

  /** 将多个实体打包成一个section，并添加到舞台中 */
  export async function packEntityToSection(addEntities: Entity[]) {
    if (addEntities.length === 0) {
      return;
    }
    addEntities = SectionMethods.shallowerEntities(addEntities);
    // 检测父亲section是否是等同
    const firstParents = SectionMethods.getFatherSections(addEntities[0]);
    if (addEntities.length > 1) {
      let isAllSameFather = true;

      for (let i = 1; i < addEntities.length; i++) {
        const secondParents = SectionMethods.getFatherSections(addEntities[i]);
        if (firstParents.length !== secondParents.length) {
          isAllSameFather = false;
          break;
        }
        // 检查父亲数组是否相同
        const firstParentsString = firstParents
          .map((section) => section.uuid)
          .sort()
          .join();
        const secondParentsString = secondParents
          .map((section) => section.uuid)
          .sort()
          .join();
        if (firstParentsString !== secondParentsString) {
          isAllSameFather = false;
          break;
        }
      }

      if (!isAllSameFather) {
        // 暂时不支持交叉section的创建
        return;
      }
    }
    for (const fatherSection of firstParents) {
      goOutSection(addEntities, fatherSection);
    }
    const section = Section.fromEntities(addEntities);
    section.text = StageManagerUtils.replaceAutoNameTemplate(await Settings.get("autoNamerSectionTemplate"), section);
    entities.addValue(section, section.uuid);
    for (const fatherSection of firstParents) {
      goInSection([section], fatherSection);
    }
    StageHistoryManager.recordStep();
  }

  /** 将选中的实体打包成一个section，并添加到舞台中 */
  export async function packEntityToSectionBySelected() {
    const selectedNodes = StageManager.getSelectedEntities();
    if (selectedNodes.length === 0) {
      return;
    }
    StageManager.packEntityToSection(selectedNodes);
  }

  export function goInSection(entities: Entity[], section: Section) {
    StageSectionInOutManager.goInSection(entities, section);
    StageHistoryManager.recordStep();
  }

  export function goOutSection(entities: Entity[], section: Section) {
    StageSectionInOutManager.goOutSection(entities, section);
    StageHistoryManager.recordStep();
  }
  /** 将所有选中的Section折叠起来 */
  export function packSelectedSection() {
    StageSectionPackManager.packSection();
    StageHistoryManager.recordStep();
  }

  /** 将所有选中的Section展开 */
  export function unpackSelectedSection() {
    StageSectionPackManager.unpackSection();
    StageHistoryManager.recordStep();
  }

  /**
   * 切换选中的Section的折叠状态
   */
  export function sectionSwitchCollapse() {
    StageSectionPackManager.switchCollapse();
    StageHistoryManager.recordStep();
  }

  export function calculateSelectedNode() {
    StageNodeTextTransfer.calculateAllSelected();
    StageHistoryManager.recordStep();
  }

  export function addConnectPointByClick(location: Vector, addToSections: Section[]) {
    StageNodeAdder.addConnectPoint(location, addToSections);
    StageHistoryManager.recordStep();
  }

  export function expandTextNodeByAI() {
    StageGeneratorAI.generateNewTextNodeBySelected();
    StageHistoryManager.recordStep();
  }

  export function addTagBySelected() {
    StageTagManager.changeTagBySelected();
  }

  export function getTagNames() {
    return StageTagManager.getTagNames();
  }

  export function moveToTag(tag: string) {
    StageTagManager.moveToTag(tag);
  }
  export function connectEntityByCrEdge(fromNode: ConnectableEntity, toNode: ConnectableEntity) {
    return StageNodeConnector.addCrEdge(fromNode, toNode);
  }
  /**
   * 刷新选中内容
   */
  export function refreshSelected() {
    const entities = getSelectedEntities();
    for (const entity of entities) {
      if (entity instanceof ImageNode) {
        entity.refresh();
      }
    }
  }

  export function alignAllSelected() {
    StageAutoAlignManager.alignAllSelected();
  }

  export function preAlignAllSelected() {
    StageAutoAlignManager.preAlignAllSelected();
  }

  export function autoLayoutFastTreeMode() {
    const entities = getSelectedEntities();
    for (const entity of entities) {
      if (entity instanceof ConnectableEntity) {
        StageAutoAlignManager.autoLayoutSelectedFastTreeMode(entity);
        return;
      }
    }
  }

  export function switchLineEdgeToCrEdge() {
    const prepareDeleteLineEdge: LineEdge[] = [];
    for (const edge of getLineEdges()) {
      if (edge instanceof LineEdge && edge.isSelected) {
        // 删除这个连线，并准备创建cr曲线
        prepareDeleteLineEdge.push(edge);
      }
    }
    for (const lineEdge of prepareDeleteLineEdge) {
      deleteEdge(lineEdge);
      connectEntityByCrEdge(lineEdge.source, lineEdge.target);
    }
  }

  export function selectAll() {
    for (const entity of entities.valuesToArray()) {
      entity.isSelected = true;
    }
  }

  /**
   * 将所有实体移动到整数坐标位置
   * 用以减小导出时的文本内容体积
   */
  export function moveAllEntityToIntegerLocation() {
    for (const textNode of getTextNodes()) {
      const currentLocation = textNode.collisionBox.getRectangle().location;
      currentLocation.x = Math.round(currentLocation.x);
      currentLocation.y = Math.round(currentLocation.y);
      textNode.moveTo(currentLocation);
    }
  }

  /**
   * 将所有选中的节点转换成Section
   */
  export function textNodeToSection() {
    StageSectionPackManager.textNodeToSection();
    StageHistoryManager.recordStep();
  }
}
