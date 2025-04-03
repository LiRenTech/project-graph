/* eslint-disable */
import { spawn } from "child_process";

// 从环境变量获取参数并分割成数组
const tauriBuildArgs = process.env.TAURI_BUILD_ARGS ? process.env.TAURI_BUILD_ARGS.split(" ") : [];

// 构造完整命令参数
const args = ["tauri", "build", ...tauriBuildArgs];

const pnpmBin = process.env.npm_execpath;

let child;

// 使用 spawn 执行命令
if (pnpmBin.endsWith("js")) {
  child = spawn("node", [pnpmBin, ...args], {
    stdio: "inherit",
  });
} else {
  child = spawn(pnpmBin, args, {
    stdio: "inherit",
  });
}

// 处理退出
child.on("exit", (code) => {
  process.exit(code || 0);
});
