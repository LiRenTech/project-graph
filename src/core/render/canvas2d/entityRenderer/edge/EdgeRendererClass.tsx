import { Vector } from "../../../../dataStruct/Vector";
import { Edge } from "../../../../entity/Edge";
import { Effect } from "../../../../effect/effect";
import { TextNode } from "../../../../entity/TextNode";

/**
 * 不同类型的边的渲染器 基类
 * 
 * 形态：
 *   正常形态
 *   自环形态
 *   偏移形态（未实现）
 * 
 * 交互时状态 阴影：
 *   鼠标悬浮阴影
 *   选中阴影
 *   即将删除警告阴影
 * 
 * 虚拟连线：
 *   鼠标拖拽时还未连接到目标
 *   鼠标拖拽时吸附到目标
 * 
 * 特效：
 *   连接成功特效
 *   删除斩断特效
 */
export abstract class EdgeRendererClass {
  constructor() {}

  isCycleState(edge: Edge): boolean {
    return edge.target.uuid === edge.source.uuid;
  }
  isNormalState(edge: Edge): boolean {
    return !this.isCycleState(edge);
  }

  /**
   * 绘制正常看到的状态
   */
  public abstract renderNormalState(edge: Edge): void;

  /**
   * 绘制自环状态
   */
  public abstract renderCycleState(edge: Edge): void;

  /**
   * 绘制鼠标hover时的额外的阴影效果
   * 实现时需要自行判断是什么形态
   */
  public abstract renderHoverShadow(edge: Edge): void;

  /**
   * 绘制选中状态下的额外阴影效果
   */
  public abstract renderSelectedShadow(edge: Edge): void;

  /**
   * 绘制在准备删除的警告状态下的额外阴影效果
   */
  public abstract renderWarningShadow(edge: Edge): void;

  /**
   * 绘制鼠标连线移动时的虚拟连线效果
   * @param startNode 
   * @param mouseLocation 世界坐标系
   */
  public abstract renderVirtualEdge(startNode: TextNode, mouseLocation: Vector): void;

  /**
   * 绘制鼠标连线移动到目标节点上吸附住 时候虚拟连线效果
   * @param startNode 
   * @param endNode 
   */
  public abstract renderVirtualConfirmedEdge(startNode: TextNode, endNode: TextNode): void;
  /**
   * 获取这个线在切断时的特效
   * 外层将在切断时根据此函数来获取特效并自动加入到渲染器中
   */
  abstract getCuttingEffects(edge: Edge): Effect[];

  /**
   * 获取这个线在连接成功时的特效
   */
  abstract getConnectedEffects(startNode: TextNode, toNode: TextNode): Effect[];
}
