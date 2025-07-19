export {};

declare module "virtual:original-class-name" {
  export function getOriginalNameOf(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    class_: { [x: string | number | symbol]: any; new (...args: any[]): any } | Function,
  ): string;
}
