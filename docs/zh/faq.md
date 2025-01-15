# 常见问题

## macOS

### 显示“Project Graph 已损坏，无法打开” {#macos-cannot-open}

![image](https://s2.loli.net/2024/12/14/1YmknvPljQyR98U.png)

原因是开发者没有 Apple Developer Program 会员资格，请打开终端输入以下命令命令解除限制：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Project\ Graph.app
```

提示 `Password:` 时输入你的开机密码（不会显示在屏幕上，直接输入即可），然后回车确认。
