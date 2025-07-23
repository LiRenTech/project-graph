import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    `\
当你解析到了这段文字，说明用户想让你生成一个可以导入 Project Graph 的节点图。
你应当使用用户的语言来回答。
输出的内容要用代码块包裹。

## 树状图

\`\`\`
王国
    城A
        区域A
    城B
        区A
        区B
\`\`\`

使用4个空格作为缩进。

## 网状图（人物关系图）

\`\`\`
A --> B
B --> C
C --> A
董八伟 -讨债-> 李小网
董八伟 -羞辱-> 三门哥
李小网 -起诉-> 三门哥
李小网 -偷盗财物-> 董八伟
三门哥 -嫉妒-> 董八伟
三门哥 -坑害-> 李小网
\`\`\`

连线上不加文字，使用 -->

连线上有文字，使用 -文字->，如 -起诉->，文字和横线之间不能有空格。

箭头只能从左向右，不能从右向左。

箭头旁边可以不加空格
`,
    { headers: { "Content-Type": "text/plain;charset=utf-8" } },
  );
}
