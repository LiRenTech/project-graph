import { Renderer } from "./render/canvas2d/renderer";
import { Camera } from "./stage/Camera";
import { Vector } from "./Vector";

export class Rectangle {
  constructor(
    public location: Vector,
    public size: Vector,
  ) {}

  public get left(): number {
    return this.location.x;
  }

  public get right(): number {
    return this.location.x + this.size.x;
  }

  public get top(): number {
    return this.location.y;
  }

  public get bottom(): number {
    return this.location.y + this.size.y;
  }

  /**
   * 和另一个矩形有部分相交（碰到一点点就算）
   */
  public isCollideWith(other: Rectangle): boolean {
    const collision_x = this.right > other.left && this.left < other.right;
    const collision_y = this.bottom > other.top && this.top < other.bottom;
    return collision_x && collision_y;
  }

  /**
   * 是否完全在另一个矩形内
   * AI写的，有待测试
   * @param other
   * @returns
   */
  public isInOther(other: Rectangle): boolean {
    const collision_x = this.left > other.left && this.right < other.right;
    const collision_y = this.top > other.top && this.bottom < other.bottom;
    return collision_x && collision_y;
  }

  /**
   * 判断点是否在矩形内
   */
  public isPointInside(point: Vector): boolean {
    const collision_x = this.left <= point.x && this.right >= point.x;
    const collision_y = this.top <= point.y && this.bottom >= point.y;
    return collision_x && collision_y;
  }

  /**
   *
   * @param scale
   * @returns
   */

  public multiply(scale: number): Rectangle {
    return new Rectangle(
      this.location.multiply(scale),
      this.size.multiply(scale),
    );
  }

  public toString(): string {
    return `[${this.location.toString()}, ${this.size.toString()}]`;
  }

  public getCenter(): Vector {
    return this.location.add(this.size.divide(2));
  }

  static fromPoints(p1: Vector, p2: Vector): Rectangle {
    const location = p1.clone();
    const size = p2.clone().subtract(p1);
    return new Rectangle(location, size);
  }

  public transformWorld2View(): Rectangle {
    return new Rectangle(
      Renderer.transformWorld2View(this.location),
      // Renderer.transformWorld2View(this.size),
      this.size.multiply(Camera.currentScale),
    );
  }

  public transformView2World(): Rectangle {
    return new Rectangle(
      Renderer.transformView2World(this.location),
      Renderer.transformView2World(this.size),
    );
  }
}
