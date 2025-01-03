# 安装

## 📦 稳定版

<Suspense>
  <GithubRelease repo="LiRenTech/project-graph" />
  <template #fallback>
    正在加载下载链接，若长时间未加载请刷新页面。
  </template>
</Suspense>

## ⚡ 开发版 (推荐)

<Suspense>
  <GithubRelease repo="LiRenTech/project-graph" nightly />
  <template #fallback>
    正在加载下载链接，若长时间未加载请刷新页面。
  </template>
</Suspense>

> [!IMPORTANT]
> macOS 可能会提示“应用已损坏，无法打开”，请参考[常见问题](./faq#macos-cannot-open)中的解决方法。

## 🅰 AUR

- [推荐，从 Nightly Release 安装] [project-graph-nightly ![AUR Version](https://img.shields.io/aur/version/project-graph-nightly?cacheSeconds=0)](https://aur.archlinux.org/packages/project-graph-nightly)
- [从源码安装，需要 Rust 环境] [project-graph-git ![AUR Version](https://img.shields.io/aur/version/project-graph-git?cacheSeconds=0)](https://aur.archlinux.org/packages/project-graph-git)
- [从 Release 安装，版本可能过时] [project-graph ![AUR Version](https://img.shields.io/aur/version/project-graph?cacheSeconds=0)](https://aur.archlinux.org/packages/project-graph)

## 系统需求

### Windows

- Windows 10+
- Edge WebView2 Runtime

### Linux

- webkit2gtk
- gtk

### Android

- Android 7.0+
- Android System WebView 87+
