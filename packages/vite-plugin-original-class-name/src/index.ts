import MagicString from "magic-string";
import { createFilter, createLogger, type Plugin } from "vite";

const logger = createLogger("info", { prefix: "[original-class-name]" });

interface Config {
  staticMethodName: string;
}

export default function originalClassName(pluginConfig: Config): Plugin {
  const filter = createFilter(["**/*.tsx"], "node_modules/**");
  const virtualModuleId = "virtual:original-class-name";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "original-class-name",
    transform(code, id) {
      if (!filter(id)) return;
      const startTime = performance.now();

      const s = new MagicString(code);
      const classRegex = /(?:^|\s)(class\s+)(\w+)/g;
      let hasChanges = false;

      let match;
      while ((match = classRegex.exec(code)) !== null) {
        const classStart = match.index + match[0].indexOf("class");
        const className = match[2];
        const classEnd = classStart + match[1].length + className.length;

        // 查找类体开始位置
        let bodyStart = classEnd;
        while (bodyStart < code.length && code[bodyStart] !== "{") {
          bodyStart++;
        }
        if (bodyStart >= code.length) continue;

        // 检查是否已有 static className
        const bodyEnd = findMatchingBrace(code, bodyStart);
        const classBody = code.slice(bodyStart + 1, bodyEnd);
        if (/static\s+className\s*=/.test(classBody)) continue;

        // 插入 static className 属性
        const insertionPoint = bodyStart + 1;
        s.appendRight(insertionPoint, `static ${pluginConfig.staticMethodName} = "${className}";\n`);
        hasChanges = true;
      }

      logger.info(`transformed ${id}, took ${(performance.now() - startTime).toFixed(2)}ms`, { timestamp: true });
      if (!hasChanges) return null;

      return {
        code: s.toString(),
      };
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `\
export function getOriginalNameOf(class_) {
  return class_.${pluginConfig.staticMethodName};
}
`;
      }
    },
  };
}

function findMatchingBrace(code: string, start: number) {
  let depth = 1;
  let pos = start + 1;

  while (pos < code.length && depth > 0) {
    switch (code[pos]) {
      case "{":
        depth++;
        break;
      case "}":
        depth--;
        break;
      case '"':
      case "'":
      case "`":
        pos = skipString(code, pos);
        continue;
      case "/":
        if (code[pos + 1] === "*") {
          pos = skipMultiLineComment(code, pos);
          continue;
        }
        if (code[pos + 1] === "/") {
          pos = skipSingleLineComment(code, pos);
          continue;
        }
    }
    pos++;
  }

  return depth === 0 ? pos : code.length;
}

// 跳过字符串字面量
function skipString(code: string, start: number) {
  const quote = code[start];
  let pos = start + 1;
  let escaped = false;

  while (pos < code.length) {
    if (escaped) {
      escaped = false;
    } else {
      if (code[pos] === "\\") escaped = true;
      else if (code[pos] === quote) return pos;
    }
    pos++;
  }
  return pos;
}

// 跳过多行注释
function skipMultiLineComment(code: string, start: number) {
  let pos = start + 2;
  while (pos < code.length - 1) {
    if (code[pos] === "*" && code[pos + 1] === "/") {
      return pos + 1;
    }
    pos++;
  }
  return pos;
}

// 跳过单行注释
function skipSingleLineComment(code: string, start: number) {
  let pos = start + 2;
  while (pos < code.length) {
    if (code[pos] === "\n") return pos;
    pos++;
  }
  return pos;
}
