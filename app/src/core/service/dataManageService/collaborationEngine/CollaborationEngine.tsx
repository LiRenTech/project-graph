import { fetch } from "@tauri-apps/plugin-http";
import { Dialog } from "../../../../components/dialog";

export namespace CollaborationEngine {
  export async function openStartCollaborationPanel() {
    const servers: string[] = await (
      await fetch((import.meta.env.LR_API_BASE_URL ?? "http://localhost:8787") + "/coserver/list")
    ).json();
    console.log(servers);
    // 测试服务器延迟
    const times = await Promise.all(
      servers.map(async (s) => {
        try {
          const start = Date.now();
          fetch(s);
          const end = Date.now();
          return end - start;
        } catch {
          return 999;
        }
      }),
    );
    console.log(times);
    // 获取最快的服务器
    const fastestServer = servers[times.indexOf(Math.min(...times))];
    console.log(fastestServer);
    // 弹窗
    await Dialog.show({
      title: "Start Collaboration",
      content: `You can start collaboration with ${fastestServer}`,
      buttons: [
        {
          text: "Start",
          onClick: () => {
            console.log("Start");
          },
        },
        {
          text: "Cancel",
          onClick: () => {
            console.log("Cancel");
          },
        },
      ],
    });
  }
}
