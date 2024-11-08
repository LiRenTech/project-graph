import { family } from "@tauri-apps/plugin-os";

export namespace PathString {
  export function absolute2file(path: string): string {
    const fam = family();
    if (fam === "windows") {
      path = path.replace(/\\/g, "/");
    }
    const file = path.split("/").pop();
    if (!file) {
      throw new Error("Invalid path");
    }
    const parts = file.split(".");
    if (parts.length > 1) {
      return parts.slice(0, -1).join(".");
    } else {
      return file;
    }
  }
}
