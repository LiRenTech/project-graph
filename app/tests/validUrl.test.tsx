import { describe, expect, it } from "vitest";
import { PathString } from "../src/utils/pathString";

describe("markdown URL", () => {
  it("标准有效链接", () => {
    let _;
    // 基础形式
    _ = PathString.isMarkdownUrl("[百度](https://www.baidu.com)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("百度");
    expect(_.url).toBe("https://www.baidu.com");

    // 带标题的链接
    _ = PathString.isMarkdownUrl('[GitHub](https://github.com "官方主页")');
    expect(_.valid).toBe(true);
    expect(_.text).toBe("GitHub");
    expect(_.url).toBe("https://github.com");

    // URL编码处理
    _ = PathString.isMarkdownUrl("[搜索](https://example.com/search?q=hello%20world)");
    expect(_.valid).toBe(true);
    expect(_.url).toBe("https://example.com/search?q=hello%20world");
  });

  it("边界测试", () => {
    let _;
    // 最小长度
    _ = PathString.isMarkdownUrl("");
    expect(_.valid).toBe(false);

    _ = PathString.isMarkdownUrl(" ");
    expect(_.valid).toBe(false);

    _ = PathString.isMarkdownUrl("   ");
    expect(_.valid).toBe(false);
    _ = PathString.isMarkdownUrl("()");
    expect(_.valid).toBe(false);
    _ = PathString.isMarkdownUrl("[]");
    expect(_.valid).toBe(false);
    _ = PathString.isMarkdownUrl("()[]()[]");
    expect(_.valid).toBe(false);

    _ = PathString.isMarkdownUrl("[]()");
    expect(_.valid).toBe(false);
    expect(_.text).toBe("");
    expect(_.url).toBe("");

    _ = PathString.isMarkdownUrl("[](bitmountain.top)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("");
    expect(_.url).toBe("bitmountain.top");

    // 超长文本（>1000字符）
    const longText = "a".repeat(1500);
    const longUrl = "https://example.com/" + "x".repeat(2000);
    _ = PathString.isMarkdownUrl(`[${longText}](${longUrl})`);
    expect(_.valid).toBe(true);
    expect(_.text).toBe(longText);
    expect(_.url).toBe(longUrl);
  });

  it("特殊字符处理", () => {
    let _;
    // 嵌套括号
    _ = PathString.isMarkdownUrl("[特殊(案例)](https://example.com/path)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("特殊(案例)");
    expect(_.url).toBe("https://example.com/path");

    // Unicode字符
    _ = PathString.isMarkdownUrl("[中文链接](https://例子.测试/路径)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("中文链接");
    expect(_.url).toBe("https://例子.测试/路径");

    // 转义字符
    _ = PathString.isMarkdownUrl("[特殊]字符](http://example.com)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("特殊]字符");
  });

  it("无效链接测试", () => {
    let _;
    // 结构不完整
    _ = PathString.isMarkdownUrl("[缺失括号");
    expect(_.valid).toBe(false);

    // 非法URL字符
    _ = PathString.isMarkdownUrl("[测试](javascript:alert(1))");
    expect(_.valid).toBe(false);

    // 空格干扰，算了吧……
    // _ = PathString.isMarkdownUrl(" [ 空格测试 ] ( http://example.com ) ");
    // expect(_.valid).toBe(true); // 应该允许前后空格
    // expect(_.url).toBe("http://example.com");

    // 多协议混淆
    _ = PathString.isMarkdownUrl("[某个其他的笔记](joplin://x-callback-url/openNote)");
    expect(_.valid).toBe(true);
    expect(_.text).toBe("某个其他的笔记");
    expect(_.url).toBe("joplin://x-callback-url/openNote");
  });
});

describe("url", () => {
  it("URL有效性检测", () => {
    expect(PathString.isValidURL("https://www.baidu.com")).toBe(true);
    expect(PathString.isValidURL("http://www.baidu.com")).toBe(true);
    expect(PathString.isValidURL("http://bitmountain.top")).toBe(true);
    expect(PathString.isValidURL("http://project-graph.top")).toBe(true);
  });
  it("省略协议头的链接", () => {
    expect(PathString.isValidURL("www.baidu.com")).toBe(true);
    expect(PathString.isValidURL("bitmountain.top")).toBe(true);
    expect(PathString.isValidURL("project-graph.top")).toBe(true);
  });
  it("纯英文字母，或者变量类型、字段名 就不能识别成链接", () => {
    expect(PathString.isValidURL("apple")).toBe(false);
    expect(PathString.isValidURL("project-graph")).toBe(false);
    expect(PathString.isValidURL("array_list")).toBe(false);
  });
  it("含有斜杠，但不是链接的东西，就不能识别成链接", () => {
    expect(PathString.isValidURL("/* test */")).toBe(false);
    expect(PathString.isValidURL("// 这是一个注释")).toBe(false);
    // 正则表达式
    expect(PathString.isValidURL("/^$/")).toBe(false);
    expect(PathString.isValidURL("/^[a-zA-Z0-9]+$/")).toBe(false);
  });
  it("特殊字符串测试", () => {
    expect(PathString.isValidURL("/")).toBe(false);
    expect(PathString.isValidURL("//")).toBe(false);
    expect(PathString.isValidURL("")).toBe(false);
    expect(PathString.isValidURL(" ")).toBe(false);
    expect(PathString.isValidURL("　")).toBe(false); // 全角空格
    expect(PathString.isValidURL(".")).toBe(false);
    expect(PathString.isValidURL("./")).toBe(false);
  });
  // 其他情况
  it("带端口的链接", () => {
    expect(PathString.isValidURL("http://example.com:8080")).toBe(true);
  });
  it("带锚点的链接", () => {
    expect(PathString.isValidURL("https://example.com#section1")).toBe(true);
    expect(PathString.isValidURL("http://example.com#section1")).toBe(true);
  });
  it("IP地址形式的链接", () => {
    expect(PathString.isValidURL("http://192.168.1.1")).toBe(true);
    expect(PathString.isValidURL("https://192.168.1.1")).toBe(true);
    expect(PathString.isValidURL("https://10.20.1.1")).toBe(true);
    expect(PathString.isValidURL("https://10.200.16.149/app/detail?id=123456")).toBe(true);
  });
  it("特殊字符的链接", () => {
    expect(PathString.isValidURL("https://example.com/path/with%20space")).toBe(true);
    expect(PathString.isValidURL("http://example.com/path/with%20space")).toBe(true);
  });
  it("长链接", () => {
    expect(
      PathString.isValidURL(
        "https://example.com/very/long/path/with/many/segments/and/query/parameters?param1=value1&param2=value2",
      ),
    ).toBe(true);
    // 腾讯QQ链接
    expect(
      PathString.isValidURL(
        "https://qm.qq.com/cgi-bin/qm/qr?k=1Wskf2Y2KJz3ARpCgzi04y_p95a78Wku&jump_from=webapi&authKey=EkjB+oWihwZIfyqVsIv2dGrNv7bhSGSIULM3+ZLU2R5AVxOUKaIRwi6TKOHlT04/",
      ),
    ).toBe(true);
  });
  it("带子域名的链接", () => {
    expect(PathString.isValidURL("http://sub.example.com")).toBe(true);
    expect(PathString.isValidURL("https://sub.example.com")).toBe(true);
    expect(PathString.isValidURL("http://sub1.sub2.example.com")).toBe(true);
    expect(PathString.isValidURL("https://sub1.sub2.example.com")).toBe(true);
  });
  it("国际化域名和特殊域名", () => {
    expect(PathString.isValidURL("http://例子.测试")).toBe(true);
    expect(PathString.isValidURL("https://例子.测试")).toBe(true);
    expect(PathString.isValidURL("https://996.icu")).toBe(true);
  });
  it("本地主机链接", () => {
    expect(PathString.isValidURL("http://localhost")).toBe(true);
    expect(PathString.isValidURL("https://localhost:3000")).toBe(true);
    expect(PathString.isValidURL("https://localhost:3000/#/")).toBe(true);
    expect(PathString.isValidURL("https://localhost:3000/index.html")).toBe(true);
    expect(PathString.isValidURL("https://localhost:3000/index")).toBe(true);
    expect(PathString.isValidURL("https://localhost:3000/index.html#section1")).toBe(true);
  });
  it("带路径的链接", () => {
    expect(PathString.isValidURL("https://example.com/path/to/resource")).toBe(true);
    expect(PathString.isValidURL("http://example.com/path/to/resource?query=param")).toBe(true);
    expect(PathString.isValidURL("https://mrjokersince1997.github.io/My-Notes/#/")).toBe(true);
    expect(PathString.isValidURL("http://mrjokersince1997.github.io/My-Notes/#/")).toBe(true);
  });
  // 一些别的协议的链接
  it("其他协议链接，也用于和其他软件联动", () => {
    expect(PathString.isValidURL("ws://example.com")).toBe(true);
    expect(PathString.isValidURL("wss://example.com")).toBe(true);
    // 其他的软件
    expect(PathString.isValidURL("joplin://x-callback-url/openNote")).toBe(true);
    expect(PathString.isValidURL("obsidian://adv-uri?uid=s4w4w8-w4848w4-w48w48-w488w4-wefwaefw")).toBe(true);
  });
});
