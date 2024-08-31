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

生成 assets.py 文件：

需要进入 assets 文件夹后在命令行输入指令 来生成 assets.py 文件

```sh
pyrcc5 image.rcc -o assets.py
```

（需要保证控制台上输入 pyrcc5 能有这个东西）

运行

```
pdm run start
```

## 踩坑

```toml
dependencies = [
    "pyqt5-qt5==5.15.2",
    # "PyQt5==5.15.2",
    "PyQt5-sip>=12.15.0",
    "appdirs>=1.4.4",
]
```

windows 下使用 pdm 安装 pyqt 这个库会报错，因此必须把 pyqt5-qt5 这个库的版本卡死在 5.15.2

并且不能同时写 `pyqt5-qt5==5.15.2` 和 `PyQt5==5.15.2` ，因为一旦写了 `PyQt5==5.15.2` ，会导致前者 `pyqt5-qt5` 的版本号发生变化进而导致安装失败。

## 如何打包

打包之前先生成生成assets.py文件。否则可能会报错

### pdm简单打包法

详见这个仓库的README

https://github.com/frostming/pdm-packer

```sh
pdm pack --exe -m project_graph.__main__:main
```

但用上面的打包是需要自己安装项目对应版本的python解释器的。

### pyinstaller打包法

启发来自于b站评论区

把内层 `project-graph-qt/src` 当成整个项目文件夹而不是 `project-graph-qt` 这个文件夹。（小天才）

即：用pycharm打开src文件夹

```
cd .\src
```

在src文件夹下创建虚拟环境 ".venv" python版本要是 3.12，这样的话，实际上有两个 .venv 虚拟环境了，外层项目文件夹下的 .venv 虚拟环境时pdm用的，这个没法用来打包。只有手动创建 `src/.venv` 里的虚拟环境才能用pyinstaller打包。

```
python -m venv .venv
```

然后激活虚拟环境

```
.\.venv\Scripts\activate
```

安装依赖

```
pip install PyQt5
pip install appdirs
```

在src文件夹下新建一个python文件，叫 `run_project.py` ，这个文件请放心创建，已添加到git忽略。

填入以下内容：

```python
"""
此文件的意义在于提供给pyinstaller打包
"""

from project_graph.__main__ import main

if __name__ == '__main__':
    main()

```

然后运行

```sh
 pyinstaller --onefile --windowed --icon=./project_graph/assets/favicon.ico run_project.py -n project-graph
```
