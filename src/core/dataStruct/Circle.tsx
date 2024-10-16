import { Vector } from "./Vector";

export class Circle {
  constructor(
    public location: Vector,
    public radius: number,
  ) {}

  isPointIn(point: Vector) {
    const distance = this.location.distance(point);
    return distance <= this.radius;
  }
}
