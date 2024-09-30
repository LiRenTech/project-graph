# Project Graph

## 启动方式

```bash
# 安装依赖
pnpm i
# windows环境使用cmd时，需要设置此环境变量
# set RUST_BACKTRACE=1
# 启动项目
pnpm tauri dev
# 在adb设备上启动
```

注意：请确保已安装 Rust 和 Node.js 环境。windows还需安装c++编译工具，具体详见

```
https://littlefean.github.io/2024/09/28/tauri%E9%A1%B9%E7%9B%AE%E5%9C%A8windows%E4%B8%8A%E7%9A%84%E5%BC%80%E5%8F%91%E8%B8%A9%E5%9D%91/
```

若发现修改代码后无法热更新，用 Ctrl+Shift+R 刷新。