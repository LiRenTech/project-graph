import { platform } from "@tauri-apps/plugin-os";
import { open } from "@tauri-apps/plugin-shell";
import Button from "../components/Button";

export default function InfoPage() {
  return (
    <>
      <div className="min-h-96 overflow-x-auto px-4 py-24">
        <h1 className="text-center text-3xl font-bold">Info Page</h1>
        <p>{navigator.userAgent}</p>
        <p>浏览器语言: {navigator.language}</p>
        <p>
          window.screen: {window.screen.width} x {window.screen.height}
        </p>
        <p>{window.location.href}</p>
        <p>colorDepth: {window.screen.colorDepth}</p>
        <p>availHeight: {window.screen.availHeight}</p>
        <p>history.length: {window.history.length}</p>

        {/* <p>设备内存: {navigator.deviceMemory || "未知"} GB</p>
        <p>网络类型: {navigator.connection?.effectiveType || "未知"}</p> */}
        <p>CPU 核心数: {navigator.hardwareConcurrency}</p>
        <p>操作系统platform(): {platform()}</p>
        <p>设备像素比: {window.devicePixelRatio}</p>

        <input type="text" />
        <Button onClick={() => open("https://project-graph.top")}>open函数打开官网</Button>
      </div>
    </>
  );
}
