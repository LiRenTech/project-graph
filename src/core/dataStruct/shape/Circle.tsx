import { Vector } from "../Vector";
import { Line } from "./Line";
import { Rectangle } from "./Rectangle";
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

  isCollideWithRectangle(rectangle: Rectangle): boolean {
    return rectangle.isPointIn(this.location);
  }

  isCollideWithLine(line: Line): boolean {
    return line.isIntersectingWithCircle(this);
  }

  getRectangle(): Rectangle {
    const left = this.location.x - this.radius;
    const top = this.location.y - this.radius;
    const right = this.location.x + this.radius;
    const bottom = this.location.y + this.radius;
    return new Rectangle(new Vector(left, top), new Vector(right, bottom));
  }
}
