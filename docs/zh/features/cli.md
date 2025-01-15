# ⌨️ CLI

可执行文件位置：

- Windows: `<安装目录>\project-graph.exe`
- Linux: `/usr/bin/project-graph`
- macOS: `/Applications/Project\ Graph.app/Contents/MacOS/project-graph`

## 打开文件

```sh
project-graph <path>
```

## 将文件导出为图片

```sh
project-graph <path> -o <output>
# 如果没有 GUI 环境：
xvfb-run -a project-graph <path> -o <output>
```

输出文件必须是 `.svg` 格式，或者可以使用 `-` 输出到标准输出（Windows 下不可用）。
