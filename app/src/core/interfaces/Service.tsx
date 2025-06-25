import { Project } from "../Project";

/**
 * @see {@link Project}
 */
export interface Service {
  tick?(): void;
  dispose?(): void | Promise<void>;
}

/**
 * @see {@link Service}
 */
export interface ServiceClass {
  readonly id: string;
  new (project: Project): Service;
}
