export {};

declare module "virtual:original-class-name" {
  export function getOriginalNameOf(class_: { [x: string | number | symbol]: any; new (...args: any[]): any }): string;
}
