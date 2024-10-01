import { Vector } from "./Vector";

export class Rectangle {
  constructor(
    public location: Vector,
    public size: Vector,
  ) {}

  public intersects(other: Rectangle): boolean {
    const left = Math.max(this.location.x, other.location.x);
    const right = Math.min(
      this.location.x + this.size.x,
      other.location.x + other.size.x,
    );
    const top = Math.max(this.location.y, other.location.y);
    const bottom = Math.min(
      this.location.y + this.size.y,
      other.location.y + other.size.y,
    );
    return left < right && top < bottom;
  }

  public multiply(scale: number): Rectangle {
    return new Rectangle(
      this.location.multiply(scale),
      this.size.multiply(scale),
    );
  }

  public toString(): string {
    return `[${this.location.toString()}, ${this.size.toString()}]`;
  }
}
