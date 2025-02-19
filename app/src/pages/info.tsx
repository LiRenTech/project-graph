import { platform } from "@tauri-apps/plugin-os";
import { Stage } from "../core/stage/Stage";
// import { open } from "@tauri-apps/plugin-shell";
// import Button from "../components/Button";

/**
 * 彩蛋界面
 * @returns
 */
export default function InfoPage() {
  return (
    <>
      <div className="h-full overflow-x-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold">作弊码</h2>
        <p className="text-panel-details-text">在舞台界面，按下此按键序列后可以触发特殊效果</p>
        {Stage.secretKeyEngine.getAllSecretKeysList().map(({ keys, name }, i) => {
          return (
            <div key={keys} className="my-2 flex items-center">
              <p className="">{i + 1}：</p>
              <p className="text-panel-text">{name}</p>
              {keys.split(" ").map((keyboardKey) => {
                return (
                  <span
                    key={keyboardKey}
                    className="bg-icon-button-bg border-icon-button-border text-icon-button-text m-1 rounded p-1 text-sm"
                  >
                    {keyboardKey}
                  </span>
                );
              })}
            </div>
          );
        })}
        {/* <h2 className="text-center text-3xl font-bold">我的统计信息</h2>
        <p>敬请期待</p>
        <h2 className="text-center text-3xl font-bold">我的解锁成就</h2>
        <p>敬请期待</p> */}
        <h2 className="text-center text-3xl font-bold">我的配置信息</h2>
        <div className="text-panel-details-text">
          <p>{navigator.userAgent}</p>
          <p>浏览器语言: {navigator.language}</p>
          <p>
            window.screen: {window.screen.width} x {window.screen.height}
          </p>
          <p>{window.location.href}</p>
          <p>colorDepth: {window.screen.colorDepth}</p>
          <p>availHeight: {window.screen.availHeight}</p>
          <p>history.length: {window.history.length}</p>
          {/* 无法解决的ts报错 */}
          {/* <p>设备内存: {navigator.deviceMemory || "未知"} GB</p>
        <p>网络类型: {navigator.connection?.effectiveType || "未知"}</p> */}
          <p>CPU 核心数: {navigator.hardwareConcurrency}</p>
          <p>操作系统platform(): {platform()}</p>
          <p>设备像素比: {window.devicePixelRatio}</p>
        </div>

        <input type="text" />
        {/* <Button onClick={() => open("https://project-graph.top")}>open函数打开官网</Button> */}
      </div>
    </>
  );
}
