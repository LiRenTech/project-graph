# 常见问题

## macOS

### 显示“Project Graph 已损坏，无法打开” {#macos-cannot-open}

![image](https://s2.loli.net/2024/12/14/1YmknvPljQyR98U.png)

原因是开发者没有 Apple Developer Program 会员资格，请打开终端输入以下命令命令解除限制：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/Project\ Graph.app
```

提示 `Password:` 时输入你的开机密码（不会显示在屏幕上，直接输入即可），然后回车确认。

## 自动备份

如果json工程文件直接放在了桌面上，在编辑时没过一段时间可能会出现一个白色图标的backup备份文件，如果没有发生特殊情况（如突然坏档），可以手动删除这些备份文件。

> [!TIP]
> 如果不想看到太多备份文件，可以在设置里直接关闭自动备份。实际上我们更建议每个json工程文件放在一个特定的文件夹里，这样还可以保证粘贴进来的图片都能自动保存到这个文件夹里，不会和其他的工程文件的图片混在一起。

### 备份文件如何恢复？

可以将其中一个backup文件直接改后缀名，改回json，将原来的json文件覆盖即可。每个备份文件都有时间，可以挑一个较近的恢复。
