import { fetch } from "@tauri-apps/plugin-http";
import OpenAI from "openai";
import { Project, service } from "@/core/Project";
import { Settings } from "@/core/service/Settings";
import { AITools } from "@/core/service/dataManageService/aiEngine/AITools";

@service("aiEngine")
export class AIEngine {
  private openai = new OpenAI({
    apiKey: "",
    dangerouslyAllowBrowser: true,
    fetch,
  });

  constructor(private readonly project: Project) {}

  async updateConfig() {
    this.openai.baseURL = await Settings.get("aiApiBaseUrl");
    this.openai.apiKey = await Settings.get("aiApiKey");
  }

  async chat(messages: OpenAI.ChatCompletionMessageParam[]) {
    await this.updateConfig();
    const stream = await this.openai.chat.completions.create({
      messages,
      model: await Settings.get("aiModel"),
      stream: true,
      stream_options: {
        include_usage: true,
      },
      tools: AITools.tools,
    });
    return stream;
  }

  async getModels() {
    await this.updateConfig();
    const resp = await this.openai.models.list();
    return resp.data.map((it) => it.id.replaceAll("models/", ""));
  }
}
