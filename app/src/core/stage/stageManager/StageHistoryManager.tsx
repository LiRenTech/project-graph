import { Project, ProjectState, service } from "@/core/Project";
import { deserialize, serialize } from "@graphif/serializer";
import { applyPatch, compare, Operation } from "fast-json-patch";
import { toast } from "sonner";

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
  patches: Operation[][] = [];
  /**
   * 历史记录列表数组上的一个指针
   */
  currentIndex = -1;
  /**
   * 数组最大长度
   */
  historySize = 20;
  initialStage: Record<string, any>[] = [];

  // 在软件启动时调用
  constructor(private readonly project: Project) {
    this.initialStage = serialize(project.stage);
  }

  /**
   * 记录一步骤
   * @param file
   */
  recordStep() {
    this.patches.splice(this.currentIndex + 1);
    // 上面一行的含义：删除从 currentIndex + 1 开始的所有元素。
    // 也就是撤回了好几步之后再做修改，后面的曾经历史就都删掉了，相当于重开了一个分支。
    const patch = compare(serialize(this.get(this.currentIndex)), serialize(this.project.stage));
    if (patch.length === 0) return;
    this.patches.push(patch);
    this.currentIndex++;
    if (this.patches.length > this.historySize) {
      // 数组长度超过最大值时，合并第一个和第二个patch
      const first = this.patches[0];
      const second = this.patches[1];
      const merged = [...first, ...second];
      this.patches = [merged, ...this.patches.slice(2)];
      this.currentIndex--;
    }
    this.project.state = ProjectState.Unsaved;
  }

  /**
   * 撤销
   */
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.project.stage = this.get(this.currentIndex);
      toast(`当前进度：${this.currentIndex + 1} / ${this.patches.length}`);
    } else {
      toast(`已到撤回到底！${this.currentIndex + 1} / ${this.patches.length}，默认 ctrl + y 反撤销`);
    }
  }

  /**
   * 反撤销
   */
  redo() {
    if (this.currentIndex < this.patches.length - 1) {
      this.currentIndex++;
      this.project.stage = this.get(this.currentIndex);
      toast(`当前进度：${this.currentIndex + 1} / ${this.patches.length}`);
    } else {
      toast(`已到最新状态！${this.currentIndex + 1} / ${this.patches.length}`);
    }
  }

  get(index: number) {
    // 先获取从0到index（包含index）的所有patch
    const patches = this.patches.slice(0, index + 1);
    // 从initialStage开始应用patch，得到在index时刻的舞台序列化数据
    const data = patches.reduce((acc, patch) => {
      return applyPatch(acc, patch).newDocument;
    }, this.initialStage);
    // 反序列化得到舞台对象
    const stage = deserialize(data);
    return stage;
  }
}
