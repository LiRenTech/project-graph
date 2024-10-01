import { Vector } from "../core/Vector";

export function getTextSize(text: string, size: number): Vector {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }
  context.font = `${size}px system-ui`;
  const metrics = context.measureText(text);
  return new Vector(metrics.width, size);
}
