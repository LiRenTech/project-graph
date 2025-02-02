# 贡献指南

## 贡献翻译

[![](https://hosted.weblate.org/widget/project-graph/287x66-black.png)](https://hosted.weblate.org/engage/project-graph/)

[前往 Weblate 翻译页面](https://hosted.weblate.org/engage/project-graph/)

## 贡献应用代码

::: details 一键配置开发环境

```
      _ _
__  _| (_)_ __   __ _ ___
\ \/ / | | '_ \ / _` / __|
 >  <| | | | | | (_| \__ \
/_/\_\_|_|_| |_|\__, |___/
                |___/

```

如果感觉配置过程过于麻烦，可以使用 [`xlings`](https://github.com/d2learn/xlings) 工具一键安装并配置环境

```
xlings install
```

> [!NOTE]
>
> - 目前已测试系统: [windows](https://github.com/LiRenTech/project-graph/issues/139#issuecomment-2470110723)、[ubuntu](https://github.com/LiRenTech/project-graph/issues/139#issuecomment-2474507140)
> - [更多一键环境配置讨论](https://github.com/LiRenTech/project-graph/issues/139)

:::

### 安装 Rust 和 Node.js

- 安装 Rust：https://www.rust-lang.org/tools/install
- 安装 Node.js：https://nodejs.org/en/download/
- 安装 pnpm：`npm install -g pnpm`

### 安装项目依赖

```
pnpm install
```

### 启动应用

```
pnpm tauri dev
```

> [!WARNING]
> 此过程需要很长时间，并且会占用大量内存，请耐心等待。

### 构建应用

```
pnpm tauri build
```

> [!WARNING]
> 此过程需要很长时间，并且会占用大量内存，请耐心等待。

> [!IMPORTANT]
> 在正常情况下，你不需要手动构建应用，Github Actions 会在每天早上 8 点自动构建并发布应用。

### 提交更改

- 安装 Gitmoji: `pnpm install -g gitmoji-cli`
- 提交更改: `gitmoji commit`

### 提交建议

如果提交的功能时间跨度较大，建议每天都拉取一下dev分支，因为项目随时可能会有大大小小的代码重构。

如果提交的功能较小，代码改动范围较小，可以直接在dev分支上修改并提交。

如果提交的功能较大，代码改动范围较大，建议先创建一个新的分支，然后在新的分支上修改并提交。
