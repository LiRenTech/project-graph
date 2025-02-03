import { describe, expect, it } from "vitest";
import { parseMarkdownToJSON } from "../src/utils/markdownParse";

describe("测试测试框架是否正常运行", () => {
  it("测试用例1", () => {
    const markdown = "# 标题1\n## 标题2\n### 标题3\n#### 标题4\n##### 标题5\n###### 标题6\n";
    const jsonObject = parseMarkdownToJSON(markdown);
    expect(jsonObject).to.deep.equal([
      {
        title: "标题1",
        content: "",
        children: [
          {
            title: "标题2",
            content: "",
            children: [
              {
                title: "标题3",
                content: "",
                children: [
                  {
                    title: "标题4",
                    content: "",
                    children: [
                      {
                        title: "标题5",
                        content: "",
                        children: [
                          {
                            title: "标题6",
                            content: "",
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("测试用例2", () => {
    const jsonObject = parseMarkdownToJSON(markdownString1);
    expect(jsonObject).to.deep.equal([
      {
        title: "标题1",
        content: "[内容1]",
        children: [
          {
            title: "标题2",
            content: "[内容2]",
            children: [
              {
                title: "标题3",
                content: "[内容3]",
                children: [],
              },
            ],
          },
        ],
      },
    ]);
  });

  it("测试用例3 - 复杂嵌套结构", () => {
    const jsonObject = parseMarkdownToJSON(markdownString2);
    expect(jsonObject).to.deep.equal([
      {
        title: "主标题",
        content: "[主内容]",
        children: [
          {
            title: "子标题1",
            content: "[子内容1]",
            children: [
              {
                title: "子标题1.1",
                content: "[子内容1.1]",
                children: [
                  {
                    title: "子标题1.1.1",
                    content: "[子内容1.1.1]",
                    children: [
                      {
                        title: "子标题1.1.1.1",
                        content: "[子内容1.1.1.1]",
                        children: [
                          {
                            title: "子标题1.1.1.1.1",
                            content: "[子内容1.1.1.1.1]",
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: "子标题2",
            content: "[子内容2]",
            children: [
              {
                title: "子标题2.1",
                content: "[子内容2.1]",
                children: [
                  {
                    title: "子标题2.1.1",
                    content: "[子内容2.1.1]",
                    children: [
                      {
                        title: "子标题2.1.1.1",
                        content: "[子内容2.1.1.1]",
                        children: [
                          {
                            title: "子标题2.1.1.1.1",
                            content: "[子内容2.1.1.1.1]",
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});

const markdownString1 = `# 标题1

[内容1]

## 标题2

[内容2]

### 标题3

[内容3]
`;

const markdownString2 = `
# 主标题

[主内容]

## 子标题1

[子内容1]

### 子标题1.1

[子内容1.1]

#### 子标题1.1.1

[子内容1.1.1]

##### 子标题1.1.1.1

[子内容1.1.1.1]

###### 子标题1.1.1.1.1

[子内容1.1.1.1.1]

## 子标题2

[子内容2]

### 子标题2.1

[子内容2.1]

#### 子标题2.1.1

[子内容2.1.1]

##### 子标题2.1.1.1

[子内容2.1.1.1]

###### 子标题2.1.1.1.1

[子内容2.1.1.1.1]
`;
