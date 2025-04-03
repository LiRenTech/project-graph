/* eslint-disable */
import { spawn } from "child_process";

// 从环境变量获取参数并分割成数组
const tauriBuildArgs = process.env.TAURI_BUILD_ARGS ? process.env.TAURI_BUILD_ARGS.split(" ") : [];

// 构造完整命令参数
const args = ["tauri", "build", ...tauriBuildArgs];

const pnpmBin = process.env.npm_execpath;

// 使用 spawn 执行命令
const child = spawn(pnpmBin.endsWith("js") ? `node ${pnpmBin}` : pnpmBin, args, {
  stdio: "inherit", // 继承 stdio 以便实时输出
});

// 处理退出
child.on("exit", (code) => {
  process.exit(code || 0);
});
