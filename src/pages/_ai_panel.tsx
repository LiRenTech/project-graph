import { Delete, Pencil, Pin } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import { PromptManager } from "../core/service/dataGenerateService/ai/PromptManager";
import { cn } from "../utils/cn";

/**
 * AI 面板
 */
export default function AiPanel({ open = false }: { open: boolean }) {
  const [userPrompts, setUserPrompts] = useState<string[]>([]);
  const [currentUserPrompt, setCurrentUserPrompt] = useState<string>();

  /** 更新界面 */
  const updateUserPrompts = async () => {
    const prompts = await PromptManager.getUserPromptList();
    setUserPrompts(prompts);
  };

  useEffect(() => {
    updateUserPrompts();
  }, []);

  const onAddUserPrompt = () => {
    const userPrompt = prompt("请输入新的提示：");
    if (userPrompt) {
      PromptManager.addUserPrompt(userPrompt).then(() => {
        updateUserPrompts();
      });
    }
  };

  const onEditUserPrompt = (index: number) => {
    const oldPrompt = userPrompts[index];
    const userPrompt = prompt("编辑提示：", oldPrompt);
    if (userPrompt) {
      PromptManager.editUserPrompt(oldPrompt, userPrompt).then(() => {
        updateUserPrompts();
      });
    }
  };

  const onSetCurrentUserPrompt = (index: number) => {
    const promptString = userPrompts[index];
    if (promptString === currentUserPrompt) {
      setCurrentUserPrompt("");
      PromptManager.setCurrentUserPrompt("").then(() => {
        updateUserPrompts();
      });
      return;
    }
    setCurrentUserPrompt(promptString);
    PromptManager.setCurrentUserPrompt(promptString).then(() => {
      updateUserPrompts();
    });
  };

  const onDeleteUserPrompt = (index: number) => {
    const promptString = userPrompts[index];
    PromptManager.deleteUserPrompt(promptString).then(() => {
      updateUserPrompts();
    });
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 scale-75 transform flex-col items-center overflow-y-scroll rounded-md border border-neutral-700 bg-neutral-900/20 px-2 py-6 opacity-0 backdrop-blur-lg",
        {
          "pointer-events-auto scale-100 opacity-100": open,
        },
      )}
    >
      <h2 className="text-lg font-bold text-gray-400">AI 面板</h2>
      <p>user prompts</p>
      <table className="my-4">
        <tbody>
          {userPrompts.map((prompt, index) => {
            return (
              <tr key={prompt} className="my-2 border-b border-gray-700">
                <td>
                  <span className="rounded-md bg-neutral-900 px-2 py-1 text-gray-400">
                    {index + 1}
                  </span>
                </td>
                <td className="max-w-lg">
                  <p
                    className={cn(
                      "cursor-text select-text px-2 text-gray-500",
                      currentUserPrompt === prompt && "text-gray-200",
                    )}
                  >
                    {prompt}
                  </p>
                </td>
                <td>
                  <IconButton onClick={() => onSetCurrentUserPrompt(index)}>
                    <Pin
                      className={cn(
                        "cursor-pointer",
                        currentUserPrompt === prompt &&
                          "rotate-90 text-red-500",
                      )}
                    />
                  </IconButton>
                  <IconButton onClick={() => onEditUserPrompt(index)}>
                    <Pencil />
                  </IconButton>
                  <IconButton onClick={() => onDeleteUserPrompt(index)}>
                    <Delete />
                  </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button onClick={onAddUserPrompt}>增加</Button>
      {currentUserPrompt === "" && (
        <p className="text-red-400">
          当前没有提示词，请添加并钉选一个提示词，或钉选已有的提示词。
        </p>
      )}
      <p>提示：输入{nodeText}表示当前选中的节点文本内容</p>
    </div>
  );
}

const nodeText = "{{nodeText}}";
