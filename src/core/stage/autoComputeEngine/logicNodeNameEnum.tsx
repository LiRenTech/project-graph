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
}
