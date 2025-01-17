/**
 * 所有逻辑节点的枚举
 */
export enum LogicNodeNameEnum {
  // 逻辑运算符
  AND = "#AND#",
  OR = "#OR#",
  NOT = "#NOT#",
  XOR = "#XOR#",
  // 测试
  TEST = "#TEST#",
  // 数学运算
  ADD = "#ADD#",
  SUBTRACT = "#SUB#",
  MULTIPLY = "#MUL#",
  DIVIDE = "#DIV#",
  MODULO = "#MOD#",
  FLOOR = "#FLOOR#",
  CEIL = "#CEIL#",
  ROUND = "#ROUND#",
  SQRT = "#SQRT#",
  POWER = "#POW#",
  LOG = "#LOG#",
  ABS = "#ABS#",
  RANDOM = "#RANDOM#",

  SIN = "#SIN#",
  COS = "#COS#",
  TAN = "#TAN#",
  // 取值运算
  MAX = "#MAX#",
  MIN = "#MIN#",
  // 比较运算
  LT = "#LT#",
  GT = "#GT#",
  LTE = "#LTE#",
  GTE = "#GTE#",
  EQ = "#EQ#",
  NEQ = "#NEQ#",

  // 字符串
  UPPER = "#UPPER#",
  LOWER = "#LOWER#",
  LEN = "#LEN#",
  COPY = "#COPY#",
  SPLIT = "#SPLIT#",
  REPLACE = "#REPLACE#",
  CONNECT = "#CONNECT#",
  // 统计
  COUNT = "#COUNT#",
  // 其他
  RGB = "#RGB#",
  RGBA = "#RGBA#",
  GET_LOCATION = "#GET_LOCATION#",
  SET_LOCATION = "#SET_LOCATION#",
  GET_SIZE = "#GET_SIZE#",
  GET_MOUSE_LOCATION = "#GET_MOUSE_LOCATION#",
  GET_CAMERA_LOCATION = "#GET_CAMERA_LOCATION#",
  SET_CAMERA_LOCATION = "#SET_CAMERA_LOCATION#",
  GET_CAMERA_SCALE = "#GET_CAMERA_SCALE#",
  SET_CAMERA_SCALE = "#SET_CAMERA_SCALE#",
  IS_COLLISION = "#IS_COLLISION#",
  GET_TIME = "#GET_TIME#",
  PLAY_SOUND = "#PLAY_SOUND#",
}
export const LogicNodeNameToRenderNameMap: {
  [key in LogicNodeNameEnum]: string;
} = {
  [LogicNodeNameEnum.AND]: "and",
  [LogicNodeNameEnum.OR]: "or",
  [LogicNodeNameEnum.NOT]: "not",
  [LogicNodeNameEnum.XOR]: "xor",
  [LogicNodeNameEnum.TEST]: "测试",
  [LogicNodeNameEnum.ADD]: "+",
  [LogicNodeNameEnum.SUBTRACT]: "-",
  [LogicNodeNameEnum.MULTIPLY]: "×",
  [LogicNodeNameEnum.DIVIDE]: "÷",
  [LogicNodeNameEnum.MODULO]: "%",
  [LogicNodeNameEnum.FLOOR]: "⌊ ⌋",
  [LogicNodeNameEnum.CEIL]: "⌈ ⌉",
  [LogicNodeNameEnum.ROUND]: "round",
  [LogicNodeNameEnum.SQRT]: "√",
  [LogicNodeNameEnum.POWER]: "幂",
  [LogicNodeNameEnum.LOG]: "log",
  [LogicNodeNameEnum.ABS]: "| |",
  [LogicNodeNameEnum.RANDOM]: "Random",
  [LogicNodeNameEnum.SIN]: "sin",
  [LogicNodeNameEnum.COS]: "cos",
  [LogicNodeNameEnum.TAN]: "tan",
  [LogicNodeNameEnum.MAX]: "Max",
  [LogicNodeNameEnum.MIN]: "Min",
  [LogicNodeNameEnum.LT]: "<",
  [LogicNodeNameEnum.GT]: ">",
  [LogicNodeNameEnum.LTE]: "≤",
  [LogicNodeNameEnum.GTE]: "≥",
  [LogicNodeNameEnum.EQ]: "==",
  [LogicNodeNameEnum.NEQ]: "≠",
  [LogicNodeNameEnum.UPPER]: "大写",
  [LogicNodeNameEnum.LOWER]: "小写",
  [LogicNodeNameEnum.LEN]: "字符长度",
  [LogicNodeNameEnum.COPY]: "复制",
  [LogicNodeNameEnum.SPLIT]: "分割",
  [LogicNodeNameEnum.REPLACE]: "替换",
  [LogicNodeNameEnum.CONNECT]: "连接",
  [LogicNodeNameEnum.COUNT]: "count",
  [LogicNodeNameEnum.RGB]: "rgb",
  [LogicNodeNameEnum.RGBA]: "rgba",
  [LogicNodeNameEnum.GET_LOCATION]: "获取节点位置",
  [LogicNodeNameEnum.SET_LOCATION]: "设置节点位置",
  [LogicNodeNameEnum.GET_SIZE]: "获取节点大小",
  [LogicNodeNameEnum.GET_MOUSE_LOCATION]: "获取鼠标位置",
  [LogicNodeNameEnum.GET_CAMERA_LOCATION]: "获取相机位置",
  [LogicNodeNameEnum.SET_CAMERA_LOCATION]: "设置相机位置",
  [LogicNodeNameEnum.GET_CAMERA_SCALE]: "获取相机缩放",
  [LogicNodeNameEnum.SET_CAMERA_SCALE]: "设置相机缩放",
  [LogicNodeNameEnum.IS_COLLISION]: "碰撞检测",
  [LogicNodeNameEnum.GET_TIME]: "获取时间",
  [LogicNodeNameEnum.PLAY_SOUND]: "播放声音",
};

/**
 * 获取逻辑节点的渲染名称
 * 如果输入的不是名称，则返回原值
 * @param name
 * @returns
 */
export function getLogicNodeRenderName(name: LogicNodeNameEnum): string {
  // 使用名称作为键来索引 LogicNodeNameToRenderNameMap 对象
  const renderName = LogicNodeNameToRenderNameMap[name];
  return renderName !== undefined ? renderName : name; // 如果找不到对应的渲染名称，则返回原值
}

/**
 * 简化的符号
 * 用于连线
 */
export enum LogicNodeSimpleOperatorEnum {
  ADD = "+",
  SUBTRACT = "-",
  MULTIPLY = "*",
  DIVIDE = "/",
  MODULO = "%",
  POWER = "**",
  // 比较
  LT = "<",
  GT = ">",
  LTE = "<=",
  GTE = ">=",
  EQ = "==",
  NEQ = "!=",
  // 逻辑
  AND = "&&",
  OR = "||",
  NOT = "!",
  XOR = "^",
}
