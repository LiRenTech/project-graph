import { Vector } from "../../../dataStruct/Vector";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";
import { Section } from "../../../stage/stageObject/entity/Section";

export class StageMouseInteractionCore {
  /**
   * 鼠标悬浮的边
   */
  private _hoverEdges: LineEdge[] = [];
  /** 鼠标悬浮的框 */
  private _hoverSections: Section[] = [];

  public isHaveHoverObject(): boolean {
    return this._hoverEdges.length > 0 || this._hoverSections.length > 0;
  }

  get hoverEdges(): LineEdge[] {
    return this._hoverEdges;
  }

  get firstHoverEdge(): LineEdge | undefined {
    return this._hoverEdges.length > 0 ? this._hoverEdges[0] : undefined;
  }

  get hoverSections(): Section[] {
    return this._hoverSections;
  }

  get firstHoverSection(): Section | undefined {
    return this._hoverSections.length > 0 ? this._hoverSections[0] : undefined;
  }

  public isHoverEdge(edge: LineEdge): boolean {
    return this._hoverEdges.includes(edge);
  }

  public isHaveHoverEdge(): boolean {
    return this._hoverEdges.length > 0;
  }

  public updateByMouseMove(mouseWorldLocation: Vector): void {
    // 更新 Edge状态
    this._hoverEdges = [];
    for (const edge of StageManager.getLineEdges()) {
      if (edge.isHiddenBySectionCollapse) {
        continue;
      }
      if (edge.collisionBox.isContainsPoint(mouseWorldLocation)) {
        this._hoverEdges.push(edge);
      }
    }
    // 更新 Section状态
    this._hoverSections = [];
    const sections = StageManager.getSections();

    for (const section of sections) {
      if (section.collisionBox.isContainsPoint(mouseWorldLocation)) {
        this._hoverSections.push(section);
      }
    }
  }
}
