# 贡献指南

1. 请自行安装 `pre-commit` 工具，然后运行 `pre-commit install` 安装 git hook，这样每次提交代码都会自动检查代码风格。
2. 请自行安装 `nonemoji` 工具，然后使用 `nonemoji commit` 提交更改。

## 打包指令

> 什么？你还在用 pyinstaller 打包？我们 linux 用户都不需要打包的

注意使用虚拟环境

```commandline
windows:
pyinstaller --onefile --windowed --icon=./assets/favicon.ico main.py -n project-graph
```

踩坑：必须在虚拟环境中安装 pyinstaller, 否则打包出来的 exe 没有 appdirs 这个依赖库

## 更新assets

需要进入assets文件夹后在命令行输入指令 `pyrcc5 image.rcc -o assets.py` 来更新assets.py文件