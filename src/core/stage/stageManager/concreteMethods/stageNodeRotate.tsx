import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { LineEffect } from "../../../service/effect/concrete/LineEffect";
import { ConnectableEntity } from "../../../stageObject/StageObject";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";
import { StageEntityMoveManager } from "./StageEntityMoveManager";

/**
 * 所有和旋转相关的操作
 */
export namespace StageNodeRotate {
  /**
   * 通过拖拽边的方式来旋转节点
   * 会查找所有选中的边，但只能旋转一个边
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    for (const edge of StageManager.getLineEdges()) {
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
        break; // 只旋转一个边
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
      visitedUUIDs.push(child.uuid);
      const childNode = StageManager.getConnectableEntityByUUID(child.uuid);
      if (!childNode) {
        console.error("child node not found");
        continue;
      }
      const midPoint = Vector.fromTwoPointsCenter(
        currentNode.geometryCenter,
        childNode.geometryCenter,
      );

      Stage.effects.push(
        new LineEffect(
          new ProgressNumber(0, 20),
          currentNode.geometryCenter,
          midPoint,
          new Color(255, 255, 255, 0),
          new Color(255, 255, 255, 0.5),
          Math.abs(degrees),
        ),
      );
      Stage.effects.push(
        new LineEffect(
          new ProgressNumber(0, 20),
          midPoint,
          childNode.geometryCenter,
          new Color(255, 255, 255, 0.5),
          new Color(255, 255, 255, 0),
          Math.abs(degrees),
        ),
      );

      rotateNodeDfs(
        rotateCenterNode,
        // 2024年10月6日：发现打开文件后，旋转节点无法带动子树，只能传递一层。
        // child,
        childNode,
        degrees,
        // visitedUUIDs.concat(currentNode.uuid),
        visitedUUIDs,
      );
    }
  }
}
