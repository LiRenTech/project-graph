# Project Graph

## 下载

tauri版本（用新的框架重写了，功能还在完善中，但还未发布视频）

```
https://liren.zty012.de/project-graph/v2/
```

PyQt5版本（两期视频中的版本）

```
https://liren.zty012.de/project-graph/v1/
或者（release页面中的早期内容）
https://github.com/LiRenTech/project-graph/releases/tag/pyqt-2024-10-3
```

## 下载安装运行后BUG解决

windows版：

下载安装后，运行后出现一个透明窗口，无法显示内容，解决方法如下：
```
C:\Users\(你的用户名)\AppData\Roaming\
```
在Roaming文件夹内新建一个“liren.project-graph”文件夹，然后进入
在内部创建两个文件：recent-files.json 和 settings.json，内容分别如下：
```
{
  "recentFiles": []
}
```

```
{"moveFriction":0.2,"windowBackgroundAlpha":1,"alwaysShowDetails":false,"showDebug":true,"scaleExponent":1.3,"lineStyle":"stright","showGrid":true,"moveAmplitude":2,"renderFont":"\"Times New Roman\", \"sans-serif\""}
```
然后再打开，就可以正常显示了。

（以上是临时解决方案，后续版本将会修复）


## 启动方式

```bash
# 安装依赖
pnpm i
# 启动项目
pnpm tauri dev
# 在adb设备上启动
```

注意：请确保已安装 Rust 和 Node.js 环境。windows还需安装c++编译工具，具体详见

```
https://littlefean.github.io/2024/09/28/tauri%E9%A1%B9%E7%9B%AE%E5%9C%A8windows%E4%B8%8A%E7%9A%84%E5%BC%80%E5%8F%91%E8%B8%A9%E5%9D%91/
```

若发现修改代码后无法热更新或者出现诡异bug，用ctrl+shift+i进入DevTools控制台后，在控制台窗口激活的情况下，按 Ctrl+Shift+R 刷新（因为窗口屏蔽了Ctrl+Shift+R快捷键，但无法屏蔽F5刷新和ctrl+shift+i等特殊的快捷键）注：F5刷新和Ctrl+Shift+R刷新不一样，F5不会刷掉缓存，Ctrl+Shift+R会刷掉缓存。

打包可执行文件

```
pnpm tauri build
```

如果是windows，可能还会遇到网络问题

```
https://github.com/tauri-apps/tauri/issues/7338
```

详见上述情况解决

## 注：

由于 PyQt5 绘制类Canvas的性能问题，已被抛弃，目前采用了Tauri作为GUI框架，并使用TypeScript (React) 和Rust语言编写。

—— 2024年10月2日