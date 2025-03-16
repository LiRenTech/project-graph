# 安装

> [!IMPORTANT]
> macOS 可能会提示“应用已损坏，无法打开”，请参考[常见问题](./faq#macos-cannot-open)中的解决方法。

::: tip 我应该选哪个？

- 如果你是初次使用，建议安装稳定版。
- 如果你想要体验最新的功能，建议安装开发版。
- 如果你会使用 Scoop 包管理器，建议使用 Scoop 安装。
- 如果你使用 Arch Linux 系统，可以使用 AUR 包。

:::

::: details 📦 稳定版 <Badge text="维护者: 官方" type="info" /> {#stable}

![GitHub Release](https://img.shields.io/github/v/release/LiRenTech/project-graph)

<GithubRelease repo="LiRenTech/project-graph" proxy changelogTitle="更新日志" />

:::

::: details ⚡ 开发版 <Badge text="维护者: 官方" type="info" />{#nightly}

> [!WARNING]
> 开发版可能有未知的 Bug。

<GithubRelease repo="LiRenTech/project-graph" nightly proxy />

:::

::: details Scoop <Badge text="维护者: DeeliN" type="info" />

![Scoop Version](https://img.shields.io/scoop/v/project-graph?bucket=https%3A%2F%2Fgithub.com%2FDeeliN221%2FExtras)

```sh
scoop bucket add pg https://github.com/DeeliN221/Extras
scoop install project-graph
```

> [!TIP]
> 若有问题请前往 [#304](https://github.com/LiRenTech/project-graph/issues/304)

:::

::: details AUR <Badge text="维护者: zty012" type="info" />

- [推荐，从 Nightly Release 安装] [project-graph-nightly-bin ![AUR Version](https://img.shields.io/aur/version/project-graph-nightly-bin)](https://aur.archlinux.org/packages/project-graph-nightly-bin)
- [从源码安装，需要 Rust 环境] [project-graph-git ![AUR Version](https://img.shields.io/aur/version/project-graph-git)](https://aur.archlinux.org/packages/project-graph-git)
- [从 Release 安装，版本可能过时] [project-graph-bin ![AUR Version](https://img.shields.io/aur/version/project-graph-bin)](https://aur.archlinux.org/packages/project-graph-bin)

:::

## 💬 下一步...

- [🔗 快速上手](./getting-started) — 快速了解基本操作。
- [📋 浏览功能](./features/node) — 学会使用应用的各种功能。
