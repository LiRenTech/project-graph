import { describe, it, expect } from "vitest";
import { PathString } from "../../utils/pathString";

describe("PathString", () => {
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
  });
  it("特殊字符的链接", () => {
    expect(PathString.isValidURL("https://example.com/path/with%20space")).toBe(
      true,
    );
    expect(PathString.isValidURL("http://example.com/path/with%20space")).toBe(
      true,
    );
  });
  it("长链接", () => {
    expect(
      PathString.isValidURL(
        "https://example.com/very/long/path/with/many/segments/and/query/parameters?param1=value1&param2=value2",
      ),
    ).toBe(true);
  });
  it("带用户信息的链接", () => {
    expect(PathString.isValidURL("http://user:password@example.com")).toBe(
      true,
    );
    expect(PathString.isValidURL("https://user:password@example.com")).toBe(
      true,
    );
  });
  it("带特殊协议的链接", () => {
    expect(PathString.isValidURL("ws://example.com")).toBe(true);
    expect(PathString.isValidURL("wss://example.com")).toBe(true);
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
    expect(PathString.isValidURL("https://localhost:3000/index.html")).toBe(
      true,
    );
    expect(PathString.isValidURL("https://localhost:3000/index")).toBe(true);
    expect(
      PathString.isValidURL("https://localhost:3000/index.html#section1"),
    ).toBe(true);
  });
  it("带路径的链接", () => {
    expect(PathString.isValidURL("https://example.com/path/to/resource")).toBe(
      true,
    );
    expect(
      PathString.isValidURL("http://example.com/path/to/resource?query=param"),
    ).toBe(true);
    expect(
      PathString.isValidURL("https://mrjokersince1997.github.io/My-Notes/#/"),
    ).toBe(true);
    expect(
      PathString.isValidURL("http://mrjokersince1997.github.io/My-Notes/#/"),
    ).toBe(true);
  });
  it("不合法的链接", () => {
    expect(PathString.isValidURL("h t t p://a.com")).toBe(false);
    expect(PathString.isValidURL("http://")).toBe(false);
    expect(PathString.isValidURL("htpp://")).toBe(false);
  });
});
