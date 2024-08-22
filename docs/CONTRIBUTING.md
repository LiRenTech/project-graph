# 贡献指南

## 风格指南

代码风格和规范详见：理刃科技文档：https://liren.zty012.de

## 打包指令

注意使用虚拟环境

```commandline
windows:
pyinstaller --onefile --windowed --icon=./assets/favicon.ico main.py -n project-graph
macOS:
pyinstaller --onefile --windowed --icon=./assets/favicon.icns main.py -n project-graph
```
