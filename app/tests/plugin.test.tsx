import { afterAll, describe, expect, it, vi } from "vitest";
import { PluginWorker } from "../src/core/plugin/PluginWorker";

describe("plugin", () => {
  const consoleMock = vi.spyOn(console, "log").mockImplementation(() => undefined);

  afterAll(() => {
    consoleMock.mockReset();
  });

  it("call test api", () => {
    new PluginWorker(
      `
      window.postMessage({
        type: "callAPIMethod",
        payload: {
          reqId: "123",
          method: "hello",
          args: ["1"]
        }
      }, "*");
    `,
      {
        permissions: ["hello"],
      },
    );
    expect(consoleMock).not.toHaveBeenLastCalledWith("hello", "1");
  });
});
