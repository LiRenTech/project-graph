import { describe, it, expect } from "vitest";
import { PathString } from "../../utils/pathString";

describe("测试路径函数", () => {
  it("absolute2file", () => {
    expect(
      PathString.absolute2file("C:\\Users\\Administrator\\Desktop\\test.txt"),
    ).toBe("test");

    expect(
      PathString.absolute2file("C:\\Users\\Administrator\\Desktop\\test.json"),
    ).toBe("test");

    expect(
      PathString.absolute2file(
        "C:\\Users\\Administrator\\Desktop\\test.testing.json",
      ),
    ).toBe("test.testing");

    expect(
      PathString.absolute2file(
        "C:\\Users\\Administrator\\Desktop\\a.b.c.d.json",
      ),
    ).toBe("a.b.c.d");
  });

  it("测试获取文件所在文件夹的路径", () => {
    expect(
      PathString.dirPath("C:\\Users\\Administrator\\Desktop\\test.json"),
    ).toBe("C:\\Users\\Administrator\\Desktop");

    expect(
      PathString.dirPath("C:\\Users\\Administrator\\Desktop\\test.txt"),
    ).toBe("C:\\Users\\Administrator\\Desktop");

    expect(
      PathString.dirPath("C:\\Users\\Administrator\\Desktop\\file"),
    ).toBe("C:\\Users\\Administrator\\Desktop");

    expect(
      PathString.dirPath("D:\\test.json"),
    ).toBe("D:");

    expect(
      PathString.dirPath("user/test.json"),
    ).toBe("user");

    // expect(
    //   PathString.dirPath("/user/test.json"),
    // ).toBe("/user");
  });
});
