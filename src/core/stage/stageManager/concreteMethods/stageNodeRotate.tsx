import { Vector } from "../../../dataStruct/Vector";
import { StageManager } from "../StageManager";
import { Stage } from "../../Stage";
import { LineEffect } from "../../../effect/concrete/LineEffect";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Color } from "../../../dataStruct/Color";
import { StageEntityMoveManager } from "./StageEntityMoveManager";
import { ConnectableEntity } from "../../../stageObject/StageObject";

/**
 * 所有和旋转相关的操作
 */
export namespace StageNodeRotate {
  /**
   * 通过拖拽边的方式来旋转节点
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    for (const edge of StageManager.getEdges()) {
      if (edge.isSelected) {
        const startMouseDragLocation = lastMoveLocation.clone();
        const endMouseDragLocation = startMouseDragLocation.add(diffLocation);
        const vectorStart = startMouseDragLocation.subtract(
          edge.source.geometryCenter,
        );
        const vectorEnd = endMouseDragLocation.subtract(
          edge.source.geometryCenter,
        );
        let degrees = vectorStart.angleToSigned(vectorEnd);
        // degrees一直是正数
        if (Number.isNaN(degrees)) {
          degrees = 0;
        }
        const sourceEntity = StageManager.getConnectableEntityByUUID(
          edge.source.uuid,
        );
        const targetEntity = StageManager.getConnectableEntityByUUID(
          edge.target.uuid,
        );

        if (sourceEntity && targetEntity) {
          rotateNodeDfs(
            StageManager.getConnectableEntityByUUID(edge.source.uuid)!,
            StageManager.getConnectableEntityByUUID(edge.target.uuid)!,
            degrees,
            [edge.source.uuid],
          );
        } else {
          console.error("source or target entity not found");
        }
      }
    }
  }

  /**
   *
   * @param rotateCenterNode 递归开始的节点
   * @param currentNode 当前递归遍历到的节点
   * @param degrees 旋转角度
   * @param visitedUUIDs 已经访问过的节点的uuid列表，用于避免死循环
   */
  export function rotateNodeDfs(
    rotateCenterNode: ConnectableEntity,
    currentNode: ConnectableEntity,
    degrees: number,
    visitedUUIDs: string[],
  ): void {
    const rotateCenterLocation = rotateCenterNode.geometryCenter;
    // 先旋转自己

    const centerToChildVector =
      currentNode.geometryCenter.subtract(rotateCenterLocation);

    const centerToChildVectorRotated =
      centerToChildVector.rotateDegrees(degrees);

    StageEntityMoveManager.moveEntityUtils(
      currentNode,
      centerToChildVectorRotated.subtract(centerToChildVector),
    );
    // 再旋转子节点
    for (const child of StageManager.nodeChildrenArray(currentNode)) {
      if (visitedUUIDs.includes(child.uuid)) {
        continue;
      }
      const childNode = StageManager.getConnectableEntityByUUID(child.uuid);
      if (!childNode) {
        console.error("child node not found");
        continue;
      }
      Stage.effects.push(
        new LineEffect(
          new ProgressNumber(0, 5),
          currentNode.geometryCenter,
          childNode.geometryCenter,
          new Color(255, 255, 255, 0),
          new Color(255, 255, 255, 0.5),
          5,
        ),
      );

      rotateNodeDfs(
        rotateCenterNode,
        // 2024年10月6日：发现打开文件后，旋转节点无法带动子树，只能传递一层。
        // child,
        childNode,
        degrees,
        visitedUUIDs.concat(currentNode.uuid),
      );
    }
  }
}
