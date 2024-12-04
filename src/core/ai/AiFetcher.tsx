
// vitest 测试时注释掉下面一行
import { fetch } from "@tauri-apps/plugin-http";

type prompt = { system: string; user: string };

/**
 * 失败的情况
 * 
 * 没网络了
 * apiKey失效了
 * 服务器挂了
 * 违规内容
 * 发送json格式不对
 * 内容数量太多
 */


/**
 * 一次性的，无上下文的，key已经在初始化的时候传入的AI请求
 * 为了统一各种AI请求的接口，抽象出了AiFetcherOneShot
 */
export abstract class AiFetcherOneShot {
  abstract name: string;

  fetchUrl: string;
  model: string;
  apiKey: string;
  prompt: prompt;

  constructor(fetchUrl: string, model: string, apiKey: string, prompt: prompt) {
    this.fetchUrl = fetchUrl;
    this.model = model;
    this.apiKey = apiKey;
    this.prompt = prompt;
  }

  setPrompt(prompt: prompt) {
    this.prompt = prompt;
    return this;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    return this;
  }
  abstract fetch(): Promise<string>;
}

/**
 * 一次性的，基于Doubao的AI请求
 */
export class AiFetcherOneShotDoubao extends AiFetcherOneShot {
  override readonly name = "Doubao";
  
  static create(): AiFetcherOneShotDoubao {
    return new AiFetcherOneShotDoubao(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      "ep-20240826150107-wkr2r",
      "",
      { system: "", user: "" },
    );
  }

  async fetch(): Promise<string> {
    const response = await fetch(this.fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.apiKey,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.prompt.system,
          },
          {
            role: "user",
            content: this.prompt.user,
          },
        ],
      }),
    });
    const data = await response.json();
    const responseContent: string = data.choices[0].message.content;
    return responseContent;
  }
}

/**
 * 一次性的，基于CloudFlare的AI请求
 */
export class AiFetcherOneShotCloudFlare extends AiFetcherOneShot {
  override readonly name = "CloudFlare";

  static create(): AiFetcherOneShotCloudFlare {
    return new AiFetcherOneShotCloudFlare(
      "https://api.cloudflare.com/client/v4/accounts/4fe6f451cbc9a9ad60e5df732070bd69/ai/run/",
      "@cf/meta/llama-3-8b-instruct",
      "",
      { system: "", user: "" },
    );
  }

  async fetch(): Promise<string> {
    const response = await fetch(
      `${this.fetchUrl}${this.model}`,
      {
        headers: {
          Authorization: "Bearer " + this.apiKey,
        },
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: this.prompt.system,
            },
            {
              role: "user",
              content: this.prompt.user,
            },
          ],
        }),
      },
    );
    const result = await response.json();
    const responseContent: string = result.result.response;
    return responseContent;
  }
}
