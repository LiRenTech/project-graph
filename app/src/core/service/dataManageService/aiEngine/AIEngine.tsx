import { fetch } from "@tauri-apps/plugin-http";
import { Dialog } from "../../../../components/dialog";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { FeatureFlags } from "../../FeatureFlags";

export namespace AIEngine {
  export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
  };

  export async function chat(messages: Message[]) {
    if (!FeatureFlags.AI) return;
    const doc = {
      entities: StageManager.getEntities()
        .filter((it) => it instanceof TextNode)
        .map((it) => ({
          uuid: it.uuid,
          location: it.collisionBox.getRectangle().location.toArray(),
          text: it.text,
          details: it.details,
          color: it.color.toArray(),
        })),
      associations: StageManager.getAssociations()
        .filter((it) => it instanceof LineEdge)
        .map((it) => ({
          source: it.source.uuid,
          target: it.target.uuid,
        })),
      entitiesInView: StageManager.getEntities()
        .filter((it) => Renderer.getCoverWorldRectangle().isCollideWithRectangle(it.collisionBox.getRectangle()))
        .map((it) => it.uuid),
      cameraLocation: Camera.location.toArray(),
    };
    const resp = await (
      await fetch(import.meta.env.LR_API_BASE_URL + "/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          document: doc,
        }),
      })
    ).json();
    await Dialog.show({
      title: "AI回复",
      content: `${resp.content}\n---\n${resp.actions.length}个动作`,
    });
  }
}
