import { Vector } from "@graphif/data-structures";
import { Project, service } from "../../../Project";
import { Edge } from "../../../stage/stageObject/association/Edge";
import { MultiTargetUndirectedEdge } from "../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { Section } from "../../../stage/stageObject/entity/Section";

@service("mouseInteraction")
export class MouseInteraction {
  constructor(private readonly project: Project) {}

  /**
   * 鼠标悬浮的边
   */
  private _hoverEdges: Edge[] = [];
  /** 鼠标悬浮的框 */
  private _hoverSections: Section[] = [];
  /**
   * 鼠标悬浮的多边形边
   */
  private _hoverMultiTargetEdges: MultiTargetUndirectedEdge[] = [];

  public isHaveHoverObject(): boolean {
    return this._hoverEdges.length > 0 || this._hoverSections.length > 0;
  }

  get hoverEdges(): Edge[] {
    return this._hoverEdges;
  }

  get firstHoverEdge(): Edge | undefined {
    return this._hoverEdges.length > 0 ? this._hoverEdges[0] : undefined;
  }

  get hoverSections(): Section[] {
    return this._hoverSections;
  }

  get firstHoverSection(): Section | undefined {
    return this._hoverSections.length > 0 ? this._hoverSections[0] : undefined;
  }
  get hoverMultiTargetEdges(): MultiTargetUndirectedEdge[] {
    return this._hoverMultiTargetEdges;
  }

  get firstHoverMultiTargetEdge(): MultiTargetUndirectedEdge | undefined {
    return this._hoverMultiTargetEdges.length > 0 ? this._hoverMultiTargetEdges[0] : undefined;
  }

  public isHoverEdge(edge: Edge): boolean {
    return this._hoverEdges.includes(edge);
  }

  public isHaveHoverEdge(): boolean {
    return this._hoverEdges.length > 0;
  }

  /**
   * mousemove 事件触发此函数
   * @param mouseWorldLocation
   */
  public updateByMouseMove(mouseWorldLocation: Vector): void {
    // 更新 Edge状态
    this._hoverEdges = [];
    for (const edge of this.project.stageManager.getEdges()) {
      if (edge.isHiddenBySectionCollapse) {
        continue;
      }
      if (edge.collisionBox.isContainsPoint(mouseWorldLocation)) {
        this._hoverEdges.push(edge);
      }
    }
    // 更新 MultiTargetUndirectedEdge状态
    this._hoverMultiTargetEdges = [];
    for (const edge of this.project.stageManager
      .getAssociations()
      .filter((association) => association instanceof MultiTargetUndirectedEdge)) {
      if (edge.collisionBox.isContainsPoint(mouseWorldLocation)) {
        this._hoverMultiTargetEdges.push(edge);
      }
    }
    // 更新 Section状态
    this._hoverSections = [];
    const sections = this.project.stageManager.getSections();

    for (const section of sections) {
      if (section.collisionBox.isContainsPoint(mouseWorldLocation)) {
        this._hoverSections.push(section);
      }
    }
  }
}
