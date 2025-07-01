import { CliMatches } from "@tauri-apps/plugin-cli";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { StageExportSvg } from "./core/service/dataGenerateService/stageExportEngine/StageExportSvg";
import { writeStdout } from "./utils/otherApi";

export async function runCli(matches: CliMatches) {
  if (matches.args.help?.occurrences > 0) {
    writeStdout(cliHelpText);
    return;
  }
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
const cliHelpText = `
    ____               _           __  ______                 __  
   / __ \\_________    (_)__  _____/ \\/ ____/________ _____  / /_ 
  / /_/ / ___/ __ \\  / / _ \\/ ___/ __\\/ __/ ___/ __ \\/ __ \\/ __ \\
 / ____/ /  / /_/ / / /  __/ /__/ /_/ \\/_/ / /  / /_/ / /_/ / / / /
/_/   /_/   \\____/_/ /\\___/\\___/\\__\\/____/_/   \\__,_/ .___/_/ /_/ 
                /___/                              /_/            

https://project-graph.top/zh/features/cli

`;
