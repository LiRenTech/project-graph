import { describe, expect, it } from "vitest";
import { PathString } from "../src/utils/PathString";

describe("PathString", () => {
  it("should resolve relative path to absolute path with simple case (Windows)", () => {
    expect(PathString.relativePathToAbsolutePath("D:/", "a.txt")).toBe("D:/a.txt");
  });

  it("should resolve relative path to absolute path with simple case (macOS/Linux)", () => {
    expect(PathString.relativePathToAbsolutePath("/Users/admin/", "a.txt")).toBe("/Users/admin/a.txt");
  });

  it("should resolve relative path with current directory (Windows)", () => {
    // 相对路径为当前目录
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/", "./test.txt")).toBe(
      "D:/Users/admin/Desktop/test.txt",
    );
  });

  it("should resolve relative path with current directory (macOS/Linux)", () => {
    // 相对路径为当前目录
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "./test.txt")).toBe(
      "/Users/admin/Desktop/test.txt",
    );
  });

  it("should resolve relative path with parent directory (Windows)", () => {
    // 相对路径为上级目录
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/", "../test2.txt")).toBe(
      "D:/Users/admin/test2.txt",
    );
  });

  it("should resolve relative path with parent directory (macOS/Linux)", () => {
    // 相对路径为上级目录
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "../test2.txt")).toBe(
      "/Users/admin/test2.txt",
    );
  });

  it("should resolve relative path with multiple parent directories (Windows)", () => {
    // 相对路径为多级上级目录
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/folder/", "../../../test3.txt")).toBe(
      "D:/Users/test3.txt",
    );
  });

  it("should resolve relative path with multiple parent directories (macOS/Linux)", () => {
    // 相对路径为多级上级目录
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/folder/", "../../../test3.txt")).toBe(
      "/Users/test3.txt",
    );
  });

  it("should resolve relative path with nested directories (Windows)", () => {
    // 相对路径为嵌套目录
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/", "./folder1/folder2/test.txt")).toBe(
      "D:/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with nested directories (macOS/Linux)", () => {
    // 相对路径为嵌套目录
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "./folder1/folder2/test.txt")).toBe(
      "/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with mixed slashes (Windows)", () => {
    // 相对路径包含正反斜杠混合
    expect(PathString.relativePathToAbsolutePath("D:\\Users\\admin\\Desktop\\", "./folder1/folder2\\test.txt")).toBe(
      "D:/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with mixed slashes (macOS/Linux)", () => {
    // 相对路径包含正反斜杠混合
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "./folder1/folder2/test.txt")).toBe(
      "/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with leading slash (Windows)", () => {
    // 相对路径以正斜杠开头
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/", "/folder1/folder2/test.txt")).toBe(
      "D:/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with leading slash (macOS/Linux)", () => {
    // 相对路径以正斜杠开头
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "/folder1/folder2/test.txt")).toBe(
      "/Users/admin/Desktop/folder1/folder2/test.txt",
    );
  });

  it("should resolve relative path with trailing slash (Windows)", () => {
    // 相对路径以正斜杠结尾
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/Desktop/", "folder1/folder2/")).toBe(
      "D:/Users/admin/Desktop/folder1/folder2",
    );
  });

  it("should resolve relative path with trailing slash (macOS/Linux)", () => {
    // 相对路径以正斜杠结尾
    expect(PathString.relativePathToAbsolutePath("/Users/admin/Desktop/", "folder1/folder2/")).toBe(
      "/Users/admin/Desktop/folder1/folder2",
    );
  });

  it("should resolve relative path with no directory change (Windows)", () => {
    // 相对路径没有目录变化
    expect(PathString.relativePathToAbsolutePath("D:/Users/admin/", "test.txt")).toBe("D:/Users/admin/test.txt");
  });

  it("should resolve relative path with no directory change (macOS/Linux)", () => {
    // 相对路径没有目录变化
    expect(PathString.relativePathToAbsolutePath("/Users/admin/", "test.txt")).toBe("/Users/admin/test.txt");
  });
});
