import { useEffect, useState } from "react";
import { Stage } from "../core/stage/Stage";

export default function SecretPage() {
  const [conflictKeys, setConflictKeys] = useState<string[]>([]);

  useEffect(() => {
    setConflictKeys(Stage.secretKeyEngine.checkSecretsRepeat());
  }, []);

  const keyNameToChar = (key: string) => {
    if (key === "arrowup") {
      return "↑";
    } else if (key === "arrowdown") {
      return "↓";
    } else if (key === "arrowleft") {
      return "←";
    } else if (key === "arrowright") {
      return "→";
    } else {
      return key;
    }
  };

  return (
    <div className="h-full overflow-x-auto px-4 py-24">
      <h2 className="text-center text-xl font-bold">
        <span>秘籍键列表</span>
        {conflictKeys.length === 0 && <span>😺</span>}
        {conflictKeys.length > 0 && <span> 出现冲突</span>}
      </h2>
      {conflictKeys.length > 0 && (
        <div className="my-2 flex flex-col items-center text-sm">
          <p className="text-panel-warning-text">注意：出现了冲突的秘籍键，请及时联系作者修复疏漏</p>
          {conflictKeys.map((key, i) => {
            return (
              <span
                key={key + i}
                className="bg-icon-button-bg border-icon-button-border text-icon-button-text m-1 rounded p-1"
              >
                {key}
              </span>
            );
          })}
        </div>
      )}

      <p className="text-panel-details-text">在舞台界面，按下此按键序列后可以触发特殊效果</p>

      {Stage.secretKeyEngine.getAllSecretKeysList().map(({ keys, name, explain }, i) => {
        return (
          <div key={keys} className="my-2 flex items-center text-sm">
            <p className="">{i + 1}：</p>
            <div className="flex flex-col">
              <div className="flex items-center">
                <p className="text-panel-text">{name}</p>
                <div className="flex flex-row">
                  {keys.split(" ").map((keyboardKey, j) => {
                    return (
                      <span
                        key={keyboardKey + j}
                        className="bg-icon-button-bg border-icon-button-border text-icon-button-text m-1 rounded p-1"
                      >
                        {keyNameToChar(keyboardKey)}
                      </span>
                    );
                  })}
                </div>
              </div>
              {explain && <p className="text-panel-details-text ml-2 text-xs">{explain}</p>}
            </div>
          </div>
        );
      })}
      <p className="text-panel-details-text">
        秘籍键可看成一种特殊的，不自定义的多序列快捷键，主要用于测试实验性功能。
      </p>
      <p className="text-panel-details-text">关于为什么会有秘籍键，可以翻阅官网文档</p>

      {conflictKeys.length === 0 && (
        <div className="text-panel-bg py-2">
          <p className="text-panel-success-text">没有发现任何冲突的秘籍键，可以放心使用秘籍键。</p>
        </div>
      )}
    </div>
  );
}
