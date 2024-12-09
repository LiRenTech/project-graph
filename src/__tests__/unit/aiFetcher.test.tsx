import { describe, it } from "vitest";
import {
  AiFetcherOneShotCloudFlare,
  AiFetcherOneShotDoubao,
} from "../../core/ai/AiFetcher";

describe("aiFetcher", () => {
  it("豆包", async () => {
    const result = await AiFetcherOneShotDoubao.create()
      .setPrompt({
        system: "你是一个助手",
        user: "你好",
      })
      .setApiKey("**************************")
      .fetch();

    console.log(result);
  });

  it("Cloudflare", async () => {
    const result = await AiFetcherOneShotCloudFlare.create()
      .setPrompt({
        system: "你是一个助手",
        user: "你好",
      })
      .setApiKey("**************************")
      .fetch();

    console.log(result);
  });
});
