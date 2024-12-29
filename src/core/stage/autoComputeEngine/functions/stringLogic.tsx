/**
 * 存放和字符串相关的函数
 * 全部的函数都应该做成
 * 输入 string[] 输出 string[]
 */
export namespace StringFunctions {
  export function upper(strings: string[]): string[] {
    return strings.map((str) => str.toUpperCase());
  }

  export function lower(strings: string[]): string[] {
    return strings.map((str) => str.toLowerCase());
  }

  export function capitalize(strings: string[]): string[] {
    return strings.map((str) => str.charAt(0).toUpperCase() + str.slice(1));
  }

  export function len(strings: string[]): string[] {
    return strings.map((str) => str.length.toString());
  }

  export function copy(strings: string[]): string[] {
    return strings.map((str) => str);
  }

  export function connect(strings: string[]): string[] {
    return [strings.join("")];
  }

  /**
   * 举例：
   * 输入 ["hello", "world", "-"]
   * 输出 ["hello-world"]
   * @param strings
   * @returns
   */
  export function join(strings: string[]): string[] {
    if (strings.length < 2) return [""];
    const sep = strings[strings.length - 1];
    return [strings.slice(0, -1).join(sep)];
  }

  export function replace(strings: string[]): string[] {
    if (strings.length < 3) return ["length less than 3"];
    const str = strings[0];
    const old = strings[1];
    const newStr = strings[2];
    return [str.replaceAll(old, newStr)];
  }

  export function trim(strings: string[]): string[] {
    return strings.map((str) => str.trim());
  }

  /**
   * 举例：
   * 输入 ["hello world", "0", "5"]
   * 输出 ["hello"]
   * @param strings
   */
  export function slice(strings: string[]): string[] {
    if (strings.length < 2) return [""];
    const str = strings[0];
    const start = parseInt(strings[1]);
    const end = strings.length > 2 ? parseInt(strings[2]) : undefined;
    return [str.slice(start, end)];
  }

  /**
   * 按照某个分隔符分割字符串
   * 举例：
   * 输入 ["hello,world", ","]
   * 输出 ["hello", "world"]
   */
  export function split(strings: string[]): string[] {
    if (strings.length < 2) return ["length less than 2"];
    const str = strings[0];
    const sep = strings[1];
    return str.split(sep);
  }

  /**
   * 计算所有字符串的长度总和
   * @param strings
   * @returns
   */
  export function length(strings: string[]): string[] {
    const sum = strings.reduce((acc, cur) => acc + cur.length, 0);
    return [sum.toString()];
  }

  /**
   * 计算一个字符串中是否包含另一个字符串
   * @param strings
   * @returns
   */
  export function contains(strings: string[]): string[] {
    if (strings.length < 2) return ["0"];
    const str = strings[0];
    const substr = strings[1];
    return [str.includes(substr).toString() ? "1" : "0"];
  }

  /**
   * 计算一个字符串是否以另一个字符串开头
   * @param strings
   * @returns
   */
  export function startsWith(strings: string[]): string[] {
    if (strings.length < 2) return ["0"];
    const str = strings[0];
    const prefix = strings[1];
    return [str.startsWith(prefix) ? "1" : "0"];
  }

  /**
   * 计算一个字符串是否以另一个字符串结尾
   * @param strings
   * @param suffix
   * @returns
   */
  export function endsWith(strings: string[]): string[] {
    if (strings.length < 2) return ["0"];
    const str = strings[0];
    const suffix = strings[1];
    return [str.endsWith(suffix) ? "1" : "0"];
  }
}
