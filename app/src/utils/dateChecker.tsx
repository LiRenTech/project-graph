/**
 * 日期检查
 */
export namespace DateChecker {
  /**
   * 判断当前是否是某月某日
   * 判断当前是否是3月15日就直接传入3和15即可
   */
  export function isCurrentEqualDate(month: number, day: number): boolean {
    const now = new Date();
    return now.getMonth() + 1 === month && now.getDate() === day;
  }
}
