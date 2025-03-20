import { Stage } from "../core/stage/Stage";

export default function SecretPage() {
  return (
    <div className="h-full overflow-x-auto px-4 py-24">
      <h2 className="text-center text-xl font-bold">秘籍键列表</h2>

      <p className="text-panel-details-text">在舞台界面，按下此按键序列后可以触发特殊效果</p>

      {Stage.secretKeyEngine.getAllSecretKeysList().map(({ keys, name }, i) => {
        return (
          <div key={keys} className="my-2 flex items-center text-sm">
            <p className="">{i + 1}：</p>
            <p className="text-panel-text">{name}</p>
            {keys.split(" ").map((keyboardKey, j) => {
              return (
                <span
                  key={keyboardKey + j}
                  className="bg-icon-button-bg border-icon-button-border text-icon-button-text m-1 rounded p-1"
                >
                  {keyboardKey}
                </span>
              );
            })}
          </div>
        );
      })}
      <p className="text-panel-details-text">
        秘籍键可看成一种特殊的，不自定义的多序列快捷键，主要用于测试实验性功能。
      </p>
      <p className="text-panel-details-text">关于为什么会有秘籍键，可以翻阅官网文档</p>
    </div>
  );
}
