import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Camera } from "../../../stage/Camera";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { StageObject } from "../../../stage/stageObject/abstract/StageObject";
import { Edge } from "../../../stage/stageObject/association/Edge";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { RectangleNoteEffect } from "../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";

export class ContentSearchEngine {
  /**
   * 搜索结果
   */
  public searchResultNodes: StageObject[] = [];

  /**
   * 是否忽略大小写
   */
  public isCaseSensitive = false;

  /**
   * 搜索结果的索引
   */
  public currentSearchResultIndex = 0;

  /**
   * 抽取一个舞台对象的被搜索文本
   * @param stageObject
   * @returns
   */
  public getStageObjectText(stageObject: StageObject): string {
    if (stageObject instanceof TextNode) {
      return stageObject.text + "　" + stageObject.details;
    } else if (stageObject instanceof Section) {
      return stageObject.text + "　" + stageObject.details;
    } else if (stageObject instanceof UrlNode) {
      return stageObject.title + "　" + stageObject.details + "　" + stageObject.url;
    }
    // 任何实体上都可能会写details
    if (stageObject instanceof Entity) {
      return stageObject.details;
    }
    // 线上的字
    if (stageObject instanceof Edge) {
      return stageObject.text;
    }
    return "";
  }

  public startSearch(searchString: string, autoFocus = true): boolean {
    // 开始搜索
    this.searchResultNodes = [];
    if (searchString === "") {
      return false;
    }
    for (const node of StageManager.getStageObject()) {
      const text = this.getStageObjectText(node);
      if (this.isCaseSensitive) {
        if (text.includes(searchString)) {
          this.searchResultNodes.push(node);
        }
      } else {
        if (text.toLowerCase().includes(searchString.toLowerCase())) {
          this.searchResultNodes.push(node);
        }
      }
    }
    this.currentSearchResultIndex = 0;

    if (this.searchResultNodes.length > 0) {
      if (autoFocus) {
        // 选择第一个搜索结果节点
        const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
        // currentNode.isSelected = true;
        Stage.effectMachine.addEffect(
          new RectangleNoteEffect(new ProgressNumber(0, 50), currentNode.collisionBox.getRectangle(), Color.Green),
        );
        // 摄像机对准现在的节点
        Camera.location = currentNode.collisionBox.getRectangle().center.clone();
      }

      return true;
    }
    return false;
  }

  /**
   * 切换下一个
   */
  public nextSearchResult() {
    if (this.currentSearchResultIndex < this.searchResultNodes.length - 1) {
      this.currentSearchResultIndex++;
    } else {
      Stage.effectMachine.addEffect(TextRiseEffect.default("已经到底了"));
      return;
    }
    // 取消选择所有节点
    for (const node of StageManager.getTextNodes()) {
      node.isSelected = false;
    }
    // 选择当前搜索结果节点
    const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
    if (currentNode) {
      Stage.effectMachine.addEffect(
        new RectangleNoteEffect(new ProgressNumber(0, 50), currentNode.collisionBox.getRectangle(), Color.Green),
      );
      // 摄像机对准现在的节点
      Camera.location = currentNode.collisionBox.getRectangle().center.clone();
    }
  }

  /**
   * 切换上一个
   */
  public previousSearchResult() {
    if (this.currentSearchResultIndex > 0) {
      this.currentSearchResultIndex--;
    } else {
      Stage.effectMachine.addEffect(TextRiseEffect.default("已经到头了"));
    }
    // 取消选择所有节点
    for (const node of StageManager.getTextNodes()) {
      node.isSelected = false;
    }
    // 选择当前搜索结果节点
    const currentNode = this.searchResultNodes[this.currentSearchResultIndex];
    if (currentNode) {
      Stage.effectMachine.addEffect(
        new RectangleNoteEffect(new ProgressNumber(0, 50), currentNode.collisionBox.getRectangle(), Color.Green),
      );
      // 摄像机对准现在的节点
      Camera.location = currentNode.collisionBox.getRectangle().center.clone();
    }
  }
}
