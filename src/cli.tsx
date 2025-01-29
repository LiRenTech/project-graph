import { CliMatches } from "@tauri-apps/plugin-cli";
import { StageDumperSvg } from "./core/stage/StageDumperSvg";
import { writeStdout } from "./utils/otherApi";
import { TauriBaseFS } from "./utils/fs/TauriFileSystem";

export async function runCli(matches: CliMatches) {
  if (matches.args.output?.occurrences > 0) {
    const outputPath = matches.args.output?.value as string;
    const outputFormat =
      outputPath.endsWith(".svg") || outputPath === "-" ? "svg" : "";
    if (outputFormat === "svg") {
      const result = StageDumperSvg.dumpStageToSVGString();
      if (outputPath === "-") {
        writeStdout(result);
      } else {
        await TauriBaseFS.writeTextFile(outputPath, result);
      }
    } else {
      throw new Error("Invalid output format. Only SVG format is supported.");
    }
  }
}
