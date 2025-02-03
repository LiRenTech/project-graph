import { CliMatches } from "@tauri-apps/plugin-cli";
import { StageExportSvg } from "./core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { writeTextFile } from "./utils/fs";
import { writeStdout } from "./utils/otherApi";

export async function runCli(matches: CliMatches) {
  if (matches.args.output?.occurrences > 0) {
    const outputPath = matches.args.output?.value as string;
    const outputFormat = outputPath.endsWith(".svg") || outputPath === "-" ? "svg" : "";
    if (outputFormat === "svg") {
      const result = StageExportSvg.dumpStageToSVGString();
      if (outputPath === "-") {
        writeStdout(result);
      } else {
        await writeTextFile(outputPath, result);
      }
    } else {
      throw new Error("Invalid output format. Only SVG format is supported.");
    }
  }
}
