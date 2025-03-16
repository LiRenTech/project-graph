# 开发指南

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

```sh
pnpm install
```

### 启动应用

```sh
# 桌面版
pnpm dev:app
# 网页版
pnpm dev:web
# 文档
pnpm dev:docs
# Android 版
pnpm dev:android
```

### 提交更改

- 安装 Gitmoji: `pnpm install -g gitmoji-cli`
- 提交更改: `gitmoji commit`

### 安装第三方库

由于本项目采用monorepo架构，涉及到增加完善功能，需要安装第三方库时，注意使用指令。

```sh
pnpm --filter @pg/app install decimal.js
```
