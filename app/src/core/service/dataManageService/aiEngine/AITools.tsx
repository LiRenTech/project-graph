import OpenAI from "openai";
import z from "zod/v4";

export namespace AITools {
  export const tools: OpenAI.ChatCompletionTool[] = [];
  export const handlers: Map<string, (...args: any[]) => any> = new Map();

  function addTool<A extends z.ZodType>(name: string, description: string, parameters: A, fn: (...args: any) => any) {
    tools.push({
      type: "function",
      function: {
        name,
        description,
        parameters: z.toJSONSchema(parameters),
        strict: true,
      },
    });
    handlers.set(name, fn);
  }

  addTool("get_all_nodes", "获取所有节点", z.object({}), () => {});
}
