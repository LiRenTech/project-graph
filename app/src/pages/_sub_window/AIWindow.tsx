import { useAtom } from "jotai";
import { Bot, Code, FolderOpen, Loader2, Send, SettingsIcon, User, Wrench } from "lucide-react";
import OpenAI from "openai";
import { useRef, useState } from "react";
import Markdown from "../../components/Markdown";
import { Rectangle } from "../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../core/dataStruct/Vector";
import { SubWindow } from "../../core/service/SubWindow";
import { activeProjectAtom } from "../../state";
import SettingsWindow from "./SettingsWindow";

export default function AIWindow() {
  const [project] = useAtom(activeProjectAtom);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<(OpenAI.ChatCompletionMessageParam & { tokens?: number })[]>([
    //     {
    //       role: "system",
    //       content: `\
    // **角色：** Project Graph AI (首席工程师，严格遵循 ReAct 模式)
    // **核心原则：**
    // 1.  **深度优先探索：** 系统性探索用户视野内节点及其父子节点，理解内容、结构、关系。
    // 2.  **基于事实行动：** 收集充分上下文前不修改节点。分析工具输出，留意新节点/关系线索。
    // 3.  **最小有效修改：** 仅进行完成任务必需的最少更改，保持图结构整洁。
    // 4.  **高度自主：** 优先使用工具解决问题。仅在多次尝试失败且信息关键时请求用户输入。
    // 5.  **专注任务：** 避免无关对话，专注迭代（思考->行动->观察）直至任务完成。
    // **关键指令：**
    // *   **ReAct 循环：** 推理->调用工具->观察结果->迭代。
    // *   **工具输出关键：** 仔细分析所有输出，主动探索输出中提到的新相关节点。
    // *   **根因分析：** 识别问题节点及其潜在关联节点（可能为根本原因）。
    //       `,
    //     },
  ]);
  const [requesting, setRequesting] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);
  const messagesElRef = useRef<HTMLDivElement>(null);

  function removeLastMessage() {
    setMessages((prev) => prev.slice(0, -1));
  }
  function addMessage(message: OpenAI.ChatCompletionMessageParam & { tokens?: number }) {
    setMessages((prev) => [...prev, message]);
  }

  function scrollToBottom() {
    if (messagesElRef.current) {
      messagesElRef.current.scrollTo({ top: messagesElRef.current.scrollHeight });
    }
  }

  async function send() {
    if (!project) return;
    scrollToBottom();
    setRequesting(true);
    setInputValue("");
    const msgs: OpenAI.ChatCompletionMessageParam[] = [
      ...messages,
      {
        role: "user",
        content: inputValue,
      },
    ];
    addMessage({
      role: "user",
      content: inputValue,
    });
    const stream = await project.aiEngine.chat(msgs);
    let streamingMsg = "";
    setStreamingMessage("");
    let lastChunk: OpenAI.ChatCompletionChunk | null = null;
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta;
      streamingMsg += delta.content;
      setStreamingMessage((v) => v + delta.content);
      scrollToBottom();
      lastChunk = chunk;
    }
    setStreamingMessage("");
    setRequesting(false);
    if (!lastChunk) return;
    if (!lastChunk.usage) return;
    removeLastMessage();
    addMessage({
      role: "user",
      content: inputValue,
      tokens: lastChunk.usage.prompt_tokens,
    });
    addMessage({
      role: "assistant",
      content: streamingMsg,
      tokens: lastChunk.usage.completion_tokens,
    });
    setTotalInputTokens((v) => v + lastChunk.usage!.prompt_tokens);
    setTotalOutputTokens((v) => v + lastChunk.usage!.completion_tokens);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }

  return project ? (
    <div className="flex h-full flex-col p-2">
      <div className="flex-1 overflow-y-auto hover:*:opacity-50" ref={messagesElRef}>
        {messages.map((message, i) => (
          <div key={i} className="hover:opacity-100! flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
              {message.role === "system" ? (
                <Code />
              ) : message.role === "user" ? (
                <User />
              ) : message.role === "assistant" ? (
                <Bot />
              ) : message.role === "tool" ? (
                <Wrench />
              ) : (
                <></>
              )}
              {/* {message.tokens && <span>{message.tokens} tokens</span>} */}
            </div>
            <div>
              {message.role !== "user" ? <Markdown source={message.content as string} /> : (message.content as string)}
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex flex-col gap-2 p-2">
            <Bot />
            <Markdown source={streamingMessage} />
          </div>
        )}
      </div>
      <div className="el-ai-input flex flex-col gap-2 rounded-xl border p-2">
        <div className="flex gap-2">
          <SettingsIcon className="el-ai-input-button cursor-pointer" onClick={() => SettingsWindow.open("ai")} />
          <div className="flex-1"></div>
          <User />
          <span>{totalInputTokens}</span>
          <Bot />
          <span>{totalOutputTokens}</span>
          <div className="flex-1"></div>
          {requesting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send className="el-ai-input-button cursor-pointer" onClick={() => send()} />
          )}
        </div>
        <textarea
          className="cursor-text outline-none"
          placeholder="What can I say?"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2 p-8">
      <FolderOpen />
      请先打开一个文件
    </div>
  );
}

AIWindow.open = () => {
  SubWindow.create({
    title: "AI",
    children: <AIWindow />,
    rect: new Rectangle(new Vector(8, 88), new Vector(350, window.innerHeight - 96)),
  });
};
