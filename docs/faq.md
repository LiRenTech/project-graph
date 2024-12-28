# 常见问题

## Windows

### 无法在 Windows 7 上安装

我们不支持 Windows 7 系统，请升级到 Windows 10 或更高版本。

## Linux

### Arch Linux: 透明窗口

```bash
sudo pacman -S downgrade
sudo downgrade webkit2gtk-4.1
# 选择 2.44.4-1 版本，然后选择 IgnorePkg
```

### 缩放画面时文字抖动

> [Avoid floating-point coordinates and use integers instead](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#avoid_floating-point_coordinates_and_use_integers_instead)

WebKit 目前不支持 Canvas 中的子像素渲染。

## macOS

### 显示“Project Graph 已损坏，无法打开” {#macos-cannot-open}

![image](https://s2.loli.net/2024/12/14/1YmknvPljQyR98U.png)

原因是开发者没有 Apple Developer Program 会员资格，请打开终端输入以下命令命令解除限制：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Project\ Graph.app
```
