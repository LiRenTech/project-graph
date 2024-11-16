import { StageManager } from "../StageManager";

export namespace StageNodeTextTransfer {
  export function calculateAllSelected() {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        try {
          const res = calculate(node.text);
          setTimeout(() => {
            node.rename(res.toString());
          }, 1000);
        } catch (e) {
          node.rename("Error");
        }
      }
    }
  }
}


function calculate(expr: string): number {
  // 去除空格
  expr = expr.replace(/\s+/g, '');

  // 定义操作符优先级
  const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
  };

  const applyOperation = (operator: string, a: number, b: number): number => {
      switch (operator) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
      }
      return 0;
  };

  const evaluate = (tokens: string[]): number => {
      const values: number[] = [];
      const ops: string[] = [];
      
      const applyTopOperation = () => {
          const b = values.pop()!;
          const a = values.pop()!;
          const op = ops.pop()!;
          values.push(applyOperation(op, a, b));
      };

      for (const token of tokens) {
          if (!isNaN(Number(token))) {
              values.push(Number(token));
          } else if (token === '(') {
              ops.push(token);
          } else if (token === ')') {
              while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                  applyTopOperation();
              }
              ops.pop(); // 弹出 '('
          } else { // 操作符
              while (ops.length > 0 && precedence[ops[ops.length - 1]] >= precedence[token]) {
                  applyTopOperation();
              }
              ops.push(token);
          }
      }

      while (ops.length > 0) {
          applyTopOperation();
      }

      return values[0];
  };

  // 正则匹配数字和操作符
  const tokens = expr.match(/\d+|[+*/()-]/g) || [];
  
  return evaluate(tokens);
}
