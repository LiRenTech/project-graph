import { check } from "@tauri-apps/plugin-updater";
import { isMobile } from "./platform";

export async function checkUpdate() {
  if (isMobile) return null;
  const update = await check();
  return update;
}
