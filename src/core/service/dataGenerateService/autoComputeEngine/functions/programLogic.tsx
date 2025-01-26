export namespace ProgramFunctions {
  export const variables: Record<string, string> = {};

  /**
   * 核心代码的获取变量值的方法
   * @param varName
   * @returns
   */
  export function getVarInCore(varName: string): string {
    if (varName in variables) {
      return variables[varName];
    }
    return "NaN";
  }

  export function isHaveVar(varName: string): boolean {
    return varName in variables;
  }

  /**
   * 设置变量，变量名不能是逻辑节点名称
   * @param args
   * @returns
   */
  export function setVar(args: string[]): string[] {
    if (args.length > 1) {
      const varName = args[0];
      if (varName.startsWith("#")) {
        return ["error", "变量名不能以#开头"];
      }
      variables[varName] = args[1];
      return ["success"];
    }
    return ["error", "参数数量错误"];
  }

  /**
   * 获取现存变量，如果没有，则返回NaN
   * @param args
   */
  export function getVar(args: string[]): string[] {
    if (args.length === 1) {
      const varName = args[0];
      return [getVarInCore(varName)];
    }
    return ["error", "参数数量错误"];
  }
}
