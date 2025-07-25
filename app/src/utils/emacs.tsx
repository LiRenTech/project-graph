/**
 * <0>: 鼠标按键0
 * <1>: 鼠标按键1
 * <x>: 鼠标按键x
 * <MWU>: MouseWheelUp
 * <MWD>: MouseWheelDown
 * key: 其他按键
 * @example
 * C-home
 * C-S-end
 * C-s
 * C-<MWU>
 */

export function parseEmacsKey(key: string): {
  key: string;
  alt: boolean;
  control: boolean;
  shift: boolean;
  meta: boolean;
}[] {
  return key.split(" ").map((it) => parseSingleEmacsKey(it));
}

/**
 * 解析按键字符串
 */
export function parseSingleEmacsKey(key: string): {
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
    ? keyPart // 保持特殊按键原样（MWU/MWD/数字等）
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
export function matchSingleEmacsKey(key: string, event: KeyboardEvent | MouseEvent | WheelEvent): boolean {
  const parsedKey = parseSingleEmacsKey(key);

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
    } else {
      matchKey = eventKey === parsedKey.key;
    }
  }
  if (event instanceof MouseEvent) {
    matchKey = event.button === parseInt(parsedKey.key.slice(1, -1));
  }
  if (event instanceof WheelEvent) {
    matchKey = (event.deltaY < 0 && parsedKey.key === "<MWU>") || (event.deltaY > 0 && parsedKey.key === "<MWD>");
  }

  return matchModifiers && matchKey;
}

export function matchEmacsKey(key: string, events: (KeyboardEvent | MouseEvent | WheelEvent)[]): boolean {
  const seq = key.trim().split(/\s+/);
  if (seq.length === 0 || events.length < seq.length) return false;

  // 从后往前比对
  for (let i = 0; i < seq.length; i++) {
    const seqIdx = seq.length - 1 - i; // 从 seq 尾部开始
    const eventIdx = events.length - 1 - i; // 从 events 尾部开始
    if (!matchSingleEmacsKey(seq[seqIdx], events[eventIdx])) {
      return false;
    }
  }
  return true;
}

/**
 * 将事件转换为emacs格式的快捷键
 */
export function formatEmacsKey(event: KeyboardEvent | MouseEvent | WheelEvent): string {
  let key = "";
  if (event instanceof KeyboardEvent) {
    const eventKey = event.key.toLowerCase();
    if (eventKey in transformedKeys) {
      key = transformedKeys[eventKey as keyof typeof transformedKeys];
    } else {
      key = event.key.toLowerCase();
    }
  }
  if (event instanceof MouseEvent) {
    key = `<${event.button}>`;
  }
  if (event instanceof WheelEvent) {
    key = event.deltaY < 0 ? "<MWU>" : "<MWD>";
  }

  const modifiers = [];
  if (event.ctrlKey) modifiers.push("C");
  if (event.altKey) modifiers.push("A");
  if (event.shiftKey) modifiers.push("S");
  if (event.metaKey) modifiers.push("M");

  return modifiers.map((it) => it + "-").join("") + key;
}
