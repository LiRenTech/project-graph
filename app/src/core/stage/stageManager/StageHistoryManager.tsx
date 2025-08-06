import { Project, ProjectState, service } from "@/core/Project";
import { deserialize, serialize } from "@graphif/serializer";
import { Delta, diff, patch } from "jsondiffpatch";
import _ from "lodash";
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
  deltas: Delta[] = [];
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
    this.deltas.splice(this.currentIndex + 1);
    // 上面一行的含义：删除从 currentIndex + 1 开始的所有元素。
    // 也就是撤回了好几步之后再做修改，后面的曾经历史就都删掉了，相当于重开了一个分支。
    this.currentIndex++;
    const prev = serialize(this.get(this.currentIndex - 1));
    const current = serialize(this.project.stage);
    const patch = diff(prev, current);
    if (!patch) return;
    this.deltas.push(patch);
    if (this.deltas.length > this.historySize) {
      // 数组长度超过最大值时，合并第一个和第二个patch
      const second = this.get(1);
      const merged = diff(this.initialStage, second);
      this.deltas.splice(0, 2, merged);
      this.currentIndex--;
    }
    this.project.state = ProjectState.Unsaved;
  }

  /**
   * 撤销
   */
  undo() {
    if (this.currentIndex >= 0) {
      this.currentIndex--;
      this.project.stage = this.get(this.currentIndex);
      toast(`当前进度：${this.currentIndex + 1} / ${this.deltas.length}`);
    } else {
      toast(`已到撤回到底！${this.currentIndex + 1} / ${this.deltas.length}，默认 ctrl + y 反撤销`);
    }
  }

  /**
   * 反撤销
   */
  redo() {
    if (this.currentIndex < this.deltas.length - 1) {
      this.currentIndex++;
      this.project.stage = this.get(this.currentIndex);
      toast(`当前进度：${this.currentIndex + 1} / ${this.deltas.length}`);
    } else {
      toast(`已到最新状态！${this.currentIndex + 1} / ${this.deltas.length}`);
    }
  }

  get(index: number) {
    // 先获取从0到index（包含index）的所有patch
    const deltas = _.cloneDeep(this.deltas.slice(0, index + 1));
    // 从initialStage开始应用patch，得到在index时刻的舞台序列化数据
    // const data = deltas.reduce((acc, delta) => {
    //   return patch(_.cloneDeep(acc), _.cloneDeep(delta)) as any;
    // }, _.cloneDeep(this.initialStage));
    let data = _.cloneDeep(this.initialStage);
    for (const delta of deltas) {
      data = patch(data, _.cloneDeep(delta)) as any;
    }
    // 反序列化得到舞台对象
    const stage = deserialize(data, this.project);
    return stage;
  }
}
