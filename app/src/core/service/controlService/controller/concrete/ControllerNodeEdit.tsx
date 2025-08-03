import { Dialog } from "@/components/ui/dialog";
import { Project } from "@/core/Project";
import { Settings } from "@/core/service/Settings";
import { ControllerClass } from "@/core/service/controlService/controller/ControllerClass";
import { PortalNode } from "@/core/stage/stageObject/entity/PortalNode";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { UrlNode } from "@/core/stage/stageObject/entity/UrlNode";
import { Path } from "@/utils/path";
import { PathString } from "@/utils/pathString";
import { isMac, isWeb } from "@/utils/platform";
import { Vector } from "@graphif/data-structures";
import { open } from "@tauri-apps/plugin-shell";
/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export class ControllerNodeEditClass extends ControllerClass {
  constructor(protected readonly project: Project) {
    super(project);
  }

  mouseDoubleClick = async (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    const pressLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const clickedEntity = this.project.stageManager.findEntityByLocation(pressLocation);

    if (clickedEntity === null) {
      return;
    }

    if (
      isMac ? this.project.controller.pressingKeySet.has("meta") : this.project.controller.pressingKeySet.has("control")
    ) {
      this.project.controllerUtils.editNodeDetails(clickedEntity);
      return;
    }

    if (clickedEntity instanceof TextNode) {
      this.project.controllerUtils.editTextNode(
        clickedEntity,
        Settings.sync.textNodeSelectAllWhenStartEditByMouseClick,
      );
    } else if (clickedEntity instanceof UrlNode) {
      const diffNodeLeftTopLocation = pressLocation.subtract(clickedEntity.rectangle.leftTop);
      if (diffNodeLeftTopLocation.y < UrlNode.titleHeight) {
        this.project.controllerUtils.editUrlNodeTitle(clickedEntity);
      } else {
        // 跳转链接
        open(clickedEntity.url);
      }
    } else if (clickedEntity instanceof PortalNode) {
      const diffNodeLeftTopLocation = pressLocation.subtract(clickedEntity.rectangle.leftTop);
      if (diffNodeLeftTopLocation.y < PortalNode.TITLE_LINE_Y) {
        // 编辑标题
        this.project.controllerUtils.editPortalNodeTitle(clickedEntity);
      } else if (diffNodeLeftTopLocation.y < PortalNode.PATH_LINE_Y) {
        // 更改路径
        const newPortalFilePath = prompt("请输入新的路径", clickedEntity.portalFilePath);
        if (newPortalFilePath) {
          clickedEntity.portalFilePath = newPortalFilePath;
        }
      } else {
        if (isWeb) {
          Dialog.show({
            title: "网页版不支持传送门",
            content: "网页版不支持传送门，请使用桌面版",
          });
          return;
        }
        // 跳转链接
        if (this.project.isDraft) {
          Dialog.show({
            title: "草稿不支持传送门",
            content: "请保存为本地文件后再传送门",
          });
          return;
        } else {
          // 开新标签页
          const relativePath = clickedEntity.portalFilePath;
          const absolutePath = new Path(this.project.uri).parent.toString();
          const newPath = PathString.relativePathToAbsolutePath(absolutePath, relativePath);
          // 开始传送
          // 不要让它立刻切换，否则会导致突然在新的文件中触发一个双击事件，创建了一个多余节点
          setTimeout(() => {
            FileLoader.openFileByPath(newPath);
            Stage.path.setPathAndChangeUI(newPath);
          }, 100);
        }
      }
    }
  };

  mouseup = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    const pressLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    for (const entity of this.project.stageManager.getEntities()) {
      // 必须有详细信息才显示详细信息按钮，进而点进去，否则会误触
      if (entity.isMouseInDetailsButton(pressLocation) && entity.details) {
        this.project.controllerUtils.editNodeDetails(entity);
        return;
      }
    }
  };

  mousemove = (event: MouseEvent) => {
    /**
     * 如果一直显示详细信息，则不显示鼠标悬停效果
     */
    if (this.project.renderer.isAlwaysShowDetails) {
      return;
    }

    const location = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    for (const node of this.project.stageManager.getTextNodes()) {
      node.isMouseHover = false;
      if (node.collisionBox.isContainsPoint(location)) {
        node.isMouseHover = true;
      }
    }
  };
}
