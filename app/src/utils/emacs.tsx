/**
 * <0>: 鼠标按键0
 * <1>: 鼠标按键1
 * <...>: 鼠标按键...
 * <MWU>: MouseWheelUp
 * <MWD>: MouseWheelDown
 * key: 其他按键
 * 不支持按键序列 eg. C-x c
 * @example
 * C-home
 * C-S-end
 * C-s
 * C-<MWU>
 */

/**
 * 解析按键字符串
 */
export function parseEmacsKey(key: string): {
  key: string;
  alt: boolean;
  control: boolean;
  shift: boolean;
  meta: boolean;
} {
  let alt = false;
  let control = false;
  let shift = false;
  let meta = false;

  const parts = key.split("-");
  if (parts.length === 0) return { key: "", alt, control, shift, meta };

  const keyPart = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  modifiers.forEach((mod) => {
    switch (mod.toUpperCase()) {
      case "C":
        control = true;
        break;
      case "S":
        shift = true;
        break;
      case "M":
        meta = true;
        break;
      case "A":
        alt = true;
        break;
    }
  });

  const specialKeyMatch = /^<(.+?)>$/.exec(keyPart);
  const parsedKey = specialKeyMatch
    ? specialKeyMatch[1] // 保持特殊按键原样（MWU/MWD/数字等）
    : keyPart.toLowerCase(); // 普通按键转为小写

  return {
    key: parsedKey,
    alt,
    control,
    shift,
    meta,
  };
}

/**
 * 解决macbook特殊中文按键符号问题
 */
const transformedKeys = {
  "【": "[",
  "】": "]",
  "；": ";",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "，": ",",
  "。": ".",
  "、": "\\",
  "《": "<",
  "》": ">",
  "？": "?",
  "！": "!",
  "：": ":",
  "·": "`",
  "¥": "$",
  "～": "~",
  "……": "^",
  "｜": "|",
};

/**
 * 检测一个emacs格式的快捷键是否匹配一个事件
 */
export function matchEmacsKey(key: string, event: KeyboardEvent | MouseEvent | WheelEvent): boolean {
  const parsedKey = parseEmacsKey(key);

  const matchModifiers =
    parsedKey.control === event.ctrlKey &&
    parsedKey.alt === event.altKey &&
    parsedKey.shift === event.shiftKey &&
    parsedKey.meta === event.metaKey;

  let matchKey = false;
  if (event instanceof KeyboardEvent) {
    const eventKey = event.key.toLowerCase();
    if (eventKey in transformedKeys) {
      matchKey = transformedKeys[eventKey as keyof typeof transformedKeys] === parsedKey.key;
    }
    matchKey = key === parsedKey.key;
  }
  if (event instanceof MouseEvent) {
    matchKey = event.button === parseInt(parsedKey.key);
  }
  if (event instanceof WheelEvent) {
    matchKey = (event.deltaY > 0 && parsedKey.key === "MWU") || (event.deltaY < 0 && parsedKey.key === "MWD");
  }

  return matchModifiers && matchKey;
}
