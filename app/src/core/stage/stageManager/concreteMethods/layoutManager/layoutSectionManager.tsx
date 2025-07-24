/**
 * 关于框嵌套结构的自动布局工具
 */
export namespace LayoutSectionManager {
  /**
   * 默认化布局所有选中的内容
   */
  export function defaultLayout() {
    // TODO: LayoutSectionManager
    // const entities = Array.from(this.project.stageManager.getEntities()).filter((node) => node.isSelected);
    // // ======= 编写以下代码
    // for (const entity of entities) {
    //   // 获取这个实体的外接矩形
    //   const rect = entity.collisionBox.getRectangle();
    //   // 移动，和移动到
    //   this.project.entityMoveManager.moveEntityUtils(entity, new Vector(10, 10), false); // 向右下移动 10 10
    //   this.project.entityMoveManager.moveEntityToUtils(entity, new Vector(10, 10)); // 移动到 10 10
    //   if (entity instanceof Section) {
    //     // 是一个框
    //     // 拿到所有第一层孩子
    //     for (const child of entity.children) {
    //       // child 也是Entity类型
    //     }
    //     // 和上面的写法是等效的
    //     for (const child of this.project.stageManager.getEntitiesByUUIDs(entity.childrenUUIDs)) {
    //     }
    //   } else {
    //     // 不是一个框，内部不可能有东西
    //   }
    //   // 如果从图论的角度上来看：想要获得的是 这个节点的第一层子级节点
    //   if (entity instanceof ConnectableEntity) {
    //     const childrens = this.project.graphMethods.nodeChildrenArray(entity);
    //     for (const child of childrens) {
    //       // child 是ConnectableEntity类型
    //       // 也就是排除了涂鸦
    //     }
    //   }
    // }
  }
}
