import { platform } from "@tauri-apps/plugin-os";

(() => {
  if (platform() === "macos") {
    window.requestAnimationFrame = (callback) => {
      setTimeout(() => {
        callback(performance.now());
      }, 16);
    };
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }
})();
