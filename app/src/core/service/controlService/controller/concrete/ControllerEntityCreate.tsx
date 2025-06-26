import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageNodeAdder } from "../../../../stage/stageManager/concreteMethods/StageNodeAdder";
import { StageObjectSelectCounter } from "../../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { ControllerClass } from "../ControllerClass";

/**
 * 创建节点的控制器
 */
export class ControllerEntityCreate extends ControllerClass {
  constructor(protected readonly project: Project) {
    super(project);
  }

  mouseDoubleClick = (event: MouseEvent) => {
    // 双击只能在左键
    if (!(event.button === 0)) {
      return;
    }
    if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      // 绘制模式不能使用创建节点
      return;
    }

    this.project.rectangleSelect.shutDown();

    const pressLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    // 排除：在实体上双击或者在线上双击
    if (
      this.project.stageManager.isEntityOnLocation(pressLocation) ||
      this.project.stageManager.isAssociationOnLocation(pressLocation)
    ) {
      return;
    }

    // 是否是在Section内部双击
    const sections = SectionMethods.getSectionsByInnerLocation(pressLocation);

    if (this.project.controller.pressingKeySet.has("`")) {
      this.createConnectPoint(pressLocation, sections);
    } else {
      // 双击创建节点
      this.project.controllerUtils.addTextNodeByLocation(pressLocation, true);
    }
    // 更新选中内容的数量
    StageObjectSelectCounter.update();
  };

  createConnectPoint(pressLocation: Vector, addToSections: Section[]) {
    StageNodeAdder.addConnectPoint(pressLocation, addToSections);
  }
}
