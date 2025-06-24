import { URI } from "vscode-uri";

/**
 * “工程”，只负责管理数据，不负责渲染。
 * 在2.0.0以前，一个应用实例对应一个工程，但在2.0.0之后，一个应用实例可以打开多个工程，通过标签页的形式切换。
 * 2.0.0以前的所有“全局单例”（namespace）在现在都被包含在一个“工程”实例中。
 * 在最开始的时候就有把所有namespace放进一个叫做“核心”（Core）的namespace中的想法，但后来想到要做多标签页，遂废弃。
 * 最初的想法中，这个概念叫做“文档”（Document），但是和原生的Document类冲突了，遂改为GraphDocument，但是觉得有点太长了，遂改为Project。
 */
export class Project {
  private constructor(
    /**
     * 工程文件的URI
     * 之所以从“路径”改为了“URI”，是因为要为后面的云同步功能做铺垫。
     * 普通的“路径”无法表示云盘中的文件，而URI可以。
     * 同时，草稿文件也从硬编码的“Project Graph”特殊文件路径改为了协议为draft、内容为UUID的URI。
     * @see https://code.visualstudio.com/api/references/vscode-api#workspace.workspaceFile
     */
    public readonly uri: URI,
  ) {
    if (uri.scheme === "draft") {
      //
    }
  }

  static newDraft(): Project {
    const uri = URI.parse("draft:" + crypto.randomUUID());
    return new Project(uri);
  }
}
