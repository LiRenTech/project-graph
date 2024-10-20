import { Vector } from "../Vector";
import { Shape } from "./Shape";

export class Circle extends Shape {
  constructor(
    public location: Vector,
    public radius: number,
  ) {
    super();
  }

  isPointIn(point: Vector) {
    const distance = this.location.distance(point);
    return distance <= this.radius;
  }
}
