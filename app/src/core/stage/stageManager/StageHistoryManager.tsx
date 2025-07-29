import toast from "react-hot-toast";
import { Serialized } from "../../../types/node";
import { Project, service } from "../../Project";
import { Settings } from "../../service/Settings";

/**
 * 专门管理历史记录
 * 负责撤销、反撤销、重做等操作
 * 具有直接更改舞台状态的能力
 *
 * 切换文件，保存时都应该重置
 */
@service("historyManager")
export class HistoryManager {
  /**
   * 历史记录列表数组
   */
  private historyList: Serialized.File[] = [];
  /**
   * 历史记录列表数组上的一个指针
   */
  private currentIndex = -1;
  /**
   * 数组最大长度
   */
  historySize = 20;

  // 在软件启动时调用
  constructor(private readonly project: Project) {
    Settings.watch("historySize", (value) => {
      // 判断是变大还是变小
      if (value < this.historySize && this.currentIndex >= value) {
        // 如果变小了，直接重置历史记录列表
        if (this.historyList.length !== 0) {
          this.historyList = [this.historyList[this.currentIndex]];
          this.currentIndex = 0;
        }
        this.historySize = value;
      } else {
        this.historySize = value;
      }
    });
  }

  reset(serializedFile: Serialized.File) {
    this.historyList = [serializedFile];
    this.currentIndex = 0;
    StageSaveManager.setIsCurrentSaved(true);
  }

  statusText(): string {
    return `当前位置：${this.currentIndex + 1}/${this.historyList.length}, max: ${this.historySize}`;
  }

  /**
   * 记录一步骤
   * @param file
   */
  recordStep() {
    this.historyList.splice(this.currentIndex + 1);
    // 上面一行的含义：删除从 currentIndex + 1 开始的所有元素。
    // 也就是撤回了好几步之后再做修改，后面的曾经历史就都删掉了，相当于重开了一个分支。
    // TODO: dump
    // this.historyList.push(this.project.stageDumper.dump());
    this.currentIndex++;
    if (this.historyList.length > this.historySize) {
      // 数组长度超过最大值时，删除最早的元素
      this.historyList.shift();
      this.currentIndex--;
    }
    // StageSaveManager.setIsCurrentSaved(false);
  }

  /**
   * 撤销
   */
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.project.stageManager.destroy();
      FileLoader.loadStageByData(this.historyList[this.currentIndex], Stage.path.getFilePath());
      toast(`当前进度：${this.currentIndex + 1} / ${this.historyList.length}`);
    } else {
      toast(`已到撤回到底！${this.currentIndex + 1} / ${this.historyList.length}，默认 ctrl + y 反撤销`);
    }
  }

  /**
   * 反撤销
   */
  redo() {
    if (this.currentIndex < this.historyList.length - 1) {
      this.currentIndex++;
      this.project.stageManager.destroy();
      FileLoader.loadStageByData(this.historyList[this.currentIndex], Stage.path.getFilePath());
      toast(`当前进度：${this.currentIndex + 1} / ${this.historyList.length}`);
    } else {
      toast(`已到最新状态！${this.currentIndex + 1} / ${this.historyList.length}`);
    }
  }
}
