import { platform } from "@tauri-apps/plugin-os";

const SIMULATE_MOBILE = false;
export const isDesktop = !SIMULATE_MOBILE && platform() !== "android";
export const isMobile = SIMULATE_MOBILE || platform() === "android";
