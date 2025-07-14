import { URI } from "vscode-uri";

export class Path {
  private readonly path: string;

  constructor(path: string);
  constructor(uri: URI);
  constructor(pathOrUri: string | URI) {
    if (typeof pathOrUri === "string") {
      this.path = pathOrUri;
    } else {
      this.path = pathOrUri.fsPath;
    }
  }

  get parent() {
    const parts = this.path.split("/");
    parts.pop();
    return new Path(parts.join("/"));
  }
  get name() {
    const parts = this.path.split("/");
    return parts[parts.length - 1];
  }
  get ext() {
    const parts = this.path.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1];
    } else {
      return "";
    }
  }
  get nameWithoutExt() {
    const parts = this.path.split(".");
    if (parts.length > 1) {
      return parts.slice(0, -1).join(".");
    } else {
      return this.name;
    }
  }
  join(path: string) {
    return new Path(this.path + "/" + path);
  }
  toUri() {
    return URI.file(this.path);
  }
  toString() {
    return this.path;
  }
}
