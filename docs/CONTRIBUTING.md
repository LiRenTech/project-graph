# 贡献指南

1. 请自行安装 `pre-commit` 工具，然后运行 `pre-commit install` 安装 git hook，这样每次提交代码都会自动检查代码风格。
2. 请自行安装 `nonemoji` 工具，然后使用 `nonemoji commit` 提交更改。



## 如何让源代码运行起来？

### windows：

先用pip安装 pipx

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

这个指令完成后可能会显示pdm安装在哪里了，比如 `C:\Users\{userName}\pipx\venvs\pdm\Scripts`，如果控制台输入pdm找不到，可以把这个路径添加到环境变量。

测试是否可以使用pdm了：

```
pdm help
```

然后进入项目文件夹

```
pdm install
```



生成assets.py文件：

需要进入assets文件夹后在命令行输入指令  来生成assets.py文件

```sh
pyrcc5 image.rcc -o assets.py
```

（需要保证控制台上输入pyrcc5能有这个东西）



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

windows下使用pdm安装pyqt这个库会报错，因此必须把 pyqt5-qt5 这个库的版本卡死在 5.15.2

并且不能同时写 `pyqt5-qt5==5.15.2` 和 `PyQt5==5.15.2` ，因为一旦写了 `PyQt5==5.15.2` ，会导致前者 `pyqt5-qt5` 的版本号发生变化进而导致安装失败。

## 如何打包

详见这个仓库的README

https://github.com/frostming/pdm-packer

```sh
pdm pack --exe -m project_graph.__main__:main
```

但用上面的打包是需要自己安装项目对应版本的python解释器的。

pyinstaller 打包的配置如下：

```
block_cipher = None

a = Analysis(['src/project_graph/__main__.py'],
             pathex=[],
             binaries=[],
             datas=[('src/project_graph/assets', 'assets')],
             hiddenimports=[],
             hookspath=[],
             hooksconfig={},
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)

exe = EXE(pyz,
          a.scripts, 
          [],
          exclude_binaries=True,
          name='project-graph',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=False,
          disable_windowed_traceback=False,
          target_arch=None,
          codesign_identity=None,
          entitlements_file=None,
          icon='src/project_graph/assets/favicon.ico' )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas, 
               strip=False,
               upx=True,
               upx_exclude=[],
               name='main')

```

把这个文件保存为`pyinstaller.spec` 然后在项目根目录下运行

```
pyinstaller pyinstaller.spec
```

但目前还会报错，有待解决