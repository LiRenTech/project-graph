/**
 * 此类产生的实例绑定在Stage上
 */
export class StageFilePathManager {
  // TODO: 有待改成private
  public draftName = "Project Graph";

  private currentPath = "Project Graph";
  /**
   * 是否是草稿
   * @returns
   */
  isDraft() {
    return this.currentPath === "Project Graph";
  }

  /**
   * 此函数唯一的调用：只能在app.tsx的useEffect检测函数中调用
   * 为了同步状态管理中的路径。
   * @param path
   */
  setPathInEffect(path: string) {
    this.currentPath = path;
  }

  /**
   * 仅舞台层面的，非UI层面的修改路径，能通过倒钩同步改变UI层
   * @param path
   */
  setPathAndChangeUI(path: string) {
    this.currentPath = path;
    this.setPathHook(path);
  }

  /**
   * 外部不允许修改此函数。
   * 除了App.tsx中
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setPathHook = (_path: string) => {};

  /**
   * 提供一个函数供外部调用，获取当前路径
   * @returns
   */
  getFilePath() {
    return this.currentPath;
  }
}
