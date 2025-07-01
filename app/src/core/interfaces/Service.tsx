import { URI } from "vscode-uri";
import { Project } from "../Project";

/**
 * @see {@link Project}
 */
export interface Service {
  tick?(): void;
  dispose?(): void | Promise<void>;
}

export interface FileSystemProvider {
  read(uri: URI): Promise<Uint8Array>;
  write(uri: URI, content: Uint8Array): Promise<void>;
  delete(uri: URI): Promise<void>;
  exists(uri: URI): Promise<boolean>;
}
