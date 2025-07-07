import { useAtom } from "jotai";
import { Bot, Code, FolderOpen, Loader2, Send, SettingsIcon, User, Wrench } from "lucide-react";
import OpenAI from "openai";
import { useState } from "react";
import Markdown from "../../components/Markdown";
import { Rectangle } from "../../core/dataStruct/shape/Rectangle";
import { Vector } from "../../core/dataStruct/Vector";
import { SubWindow } from "../../core/service/SubWindow";
import { activeProjectAtom } from "../../state";
import SettingsWindow from "./SettingsWindow";

export default function AIWindow() {
  const [project] = useAtom(activeProjectAtom);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);

  function addMessage(message: OpenAI.ChatCompletionMessageParam) {
    setMessages((prev) => [...prev, message]);
  }

  async function send() {
    if (!project) return;
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
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta;
      streamingMsg += delta.content;
      setStreamingMessage((v) => v + delta.content);
      if (chunk.usage) {
        setTotalInputTokens((v) => v + chunk.usage!.prompt_tokens);
        setTotalOutputTokens((v) => v + chunk.usage!.completion_tokens);
      }
    }
    setStreamingMessage("");
    addMessage({
      role: "assistant",
      content: streamingMsg,
    });
    setRequesting(false);
  }

  return project ? (
    <div className="flex h-full flex-col p-2">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, i) => (
          <div key={i} className="flex flex-col gap-2 p-2">
            <div>
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
            </div>
            <div>
              {message.role === "assistant" ? (
                <Markdown source={message.content as string} />
              ) : (
                (message.content as string)
              )}
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
