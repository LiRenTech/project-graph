import { fetch } from "@tauri-apps/plugin-http";
import { getDeviceId } from "@/utils/otherApi";
import { FeatureFlags } from "@/core/service/FeatureFlags";
import { Settings } from "@/core/service/Settings";

export namespace Telemetry {
  let deviceId = "";

  export async function event(event: string, data: any = {}) {
    if (!FeatureFlags.TELEMETRY) return;
    if (!Settings.sync.allowTelemetry) return;
    if (!deviceId) {
      deviceId = await getDeviceId();
    }
    await fetch(import.meta.env.LR_API_BASE_URL + "/api/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        user: deviceId,
        data,
      }),
    });
  }
}
