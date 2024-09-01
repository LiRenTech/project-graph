# 贡献指南

1. 请自行安装 `pre-commit` 工具，然后运行 `pre-commit install` 安装 git hook，这样每次提交代码都会自动检查代码风格。
2. 请自行安装 `nonemoji` 工具，然后使用 `nonemoji commit` 提交更改。

## 如何让源代码运行起来？

### windows：

先用 pip 安装 pipx

```shell
python -m pip install --user pipx
# 必须要用pipx安装pdm，不要用pip安装pdm，否则容易出问题，此项目是python3.12的
```

然后

```
pipx ensurepath
```

然后

```
pipx install pdm
```

这个指令完成后可能会显示 pdm 安装在哪里了，比如 `C:\Users\{userName}\pipx\venvs\pdm\Scripts`，如果控制台输入 pdm 找不到，可以把这个路径添加到环境变量。

测试是否可以使用 pdm 了：

```
pdm help
```

然后进入项目文件夹

```
pdm install
```

<!-- 生成 assets.py 文件：

需要进入 assets 文件夹后在命令行输入指令 来生成 assets.py 文件

```sh
pyrcc5 image.rcc -o assets.py
```

（需要保证控制台上输入 pyrcc5 能有这个东西） -->

运行

```
pdm run start
```

## 如何打包

打包之前先生成生成 assets.py 文件。否则可能会报错

### pdm 简单打包法

详见这个仓库的 README

https://github.com/frostming/pdm-packer

```sh
pdm pack --exe -m project_graph.__main__:main
```

但用上面的打包是需要自己安装项目对应版本的 python 解释器的。

### pyinstaller 打包法

启发来自于 b 站评论区

> 把内层 `project-graph-qt/src` 当成整个项目文件夹而不是 `project-graph-qt` 这个文件夹。（小天才）
>
> 即：用 pycharm 打开 src 文件夹

```bash
pdm install --with package
pdm package
```

这个命令会运行 `package.py`
