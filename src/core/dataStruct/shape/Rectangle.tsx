import { Line } from "./Line";
import { Renderer } from "../../render/canvas2d/renderer";
import { Camera } from "../../stage/Camera";
import { Vector } from "../Vector";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
  constructor(
    public location: Vector,
    public size: Vector,
  ) {
    super();
  }

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

  public get center(): Vector {
    return this.location.add(this.size.divide(2));
  }

  public get leftCenter(): Vector {
    return new Vector(this.left, this.center.y);
  }

  public get rightCenter(): Vector {
    return new Vector(this.right, this.center.y);
  }

  public get topCenter(): Vector {
    return new Vector(this.center.x, this.top);
  }

  public get bottomCenter(): Vector {
    return new Vector(this.center.x, this.bottom);
  }
  getRectangle(): Rectangle {
    return this.clone();
  }

  /**
   * 以中心点为中心，扩展矩形
   * @param amount
   * @returns
   */
  public expandFromCenter(amount: number): Rectangle {
    const halfAmount = amount / 2;
    const newSize = this.size.add(new Vector(amount, amount));
    const newLocation = this.center
      .subtract(newSize.divide(2))
      .subtract(new Vector(halfAmount, halfAmount));
    return new Rectangle(newLocation, newSize);
  }

  public clone(): Rectangle {
    return new Rectangle(this.location.clone(), this.size.clone());
  }

  /**
   * 通过四条边来创建矩形
   * @param left
   * @param top
   * @param right
   * @param bottom
   * @returns
   */
  public static fromEdges(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Rectangle {
    const location = new Vector(left, top);
    const size = new Vector(right - left, bottom - top);
    return new Rectangle(location, size);
  }

  /**
   * 通过两个点来创建矩形，可以用于框选生成矩形
   * @param p1
   * @param p2
   * @returns
   */
  public static fromTwoPoints(p1: Vector, p2: Vector): Rectangle {
    const left = Math.min(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const right = Math.max(p1.x, p2.x);
    const bottom = Math.max(p1.y, p2.y);
    return Rectangle.fromEdges(left, top, right, bottom);
  }

  /**
   * 获取多个矩形的最小外接矩形
   * @param rectangles
   * @returns
   */
  public static getBoundingRectangle(rectangles: Rectangle[]): Rectangle {
    if (rectangles.length === 0) {
      // 抛出异常
      throw new Error("rectangles is empty");
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const rect of rectangles) {
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    return Rectangle.fromEdges(left, top, right, bottom);
  }

  /**
   * 按照 上右下左 的顺序返回四条边
   * @returns 
   */
  public getBoundingLines(): Line[] {
    const lines: Line[] = [
      // top line
      new Line(
        new Vector(this.left, this.top),
        new Vector(this.right, this.top),
      ),
      // right line
      new Line(
        new Vector(this.right, this.top),
        new Vector(this.right, this.bottom),
      ),
      // bottom line
      new Line(
        new Vector(this.right, this.bottom),
        new Vector(this.left, this.bottom),
      ),
      // left line
      new Line(
        new Vector(this.left, this.bottom),
        new Vector(this.left, this.top),
      ),
    ];

    return lines;
  }

  getFroePoints(): Vector[] {
    const points = [
      new Vector(this.left, this.top),
      new Vector(this.right, this.top),
      new Vector(this.right, this.bottom),
      new Vector(this.left, this.bottom),
    ];
    return points;
  }

  /**
   * 和另一个矩形有部分相交（碰到一点点就算）
   */
  public isCollideWith(other: Rectangle): boolean {
    const collision_x = this.right > other.left && this.left < other.right;
    const collision_y = this.bottom > other.top && this.top < other.bottom;
    return collision_x && collision_y;
  }
  isCollideWithRectangle(rectangle: Rectangle): boolean {
    return this.isCollideWith(rectangle);
  }

  /**
   * 自己这个矩形是否和线段有交点
   * 用于节点切割检测
   *
   * @param line
   */
  public isCollideWithLine(line: Line): boolean {
    if (this.isPointIn(line.start) || this.isPointIn(line.end)) {
      // 当用于切割线的时候，两个端点必定都在矩形外
      // 这个实际上是不可能的，但是为了保险起见，还是加上判断
      return true;
    }

    if (
      line.isIntersectingWithHorizontalLine(
        this.location.y,
        this.left,
        this.right,
      )
    ) {
      return true;
    }

    if (
      line.isIntersectingWithHorizontalLine(
        this.location.y + this.size.y,
        this.left,
        this.right,
      )
    ) {
      return true;
    }

    if (
      line.isIntersectingWithVerticalLine(
        this.location.x,
        this.bottom,
        this.top,
      )
    ) {
      return true;
    }

    if (
      line.isIntersectingWithVerticalLine(
        this.location.x + this.size.x,
        this.bottom,
        this.top,
      )
    ) {
      return true;
    }
    return false;
  }

  /**
   * 获取线段和矩形的交点
   * @param line
   */
  public getCollidePointsWithLine(line: Line): Vector[] {
    const result: Vector[] = [];
    if (this.isPointIn(line.start)) {
      result.push(line.start);
    }
    if (this.isPointIn(line.end)) {
      result.push(line.end);
    }
    const topResult = line.getIntersectingWithHorizontalLine(
      this.location.y,
      this.left,
      this.right,
    );
    if (topResult.intersects) {
      result.push(topResult.point!);
    }
    const bottomResult = line.getIntersectingWithHorizontalLine(
      this.location.y + this.size.y,
      this.left,
      this.right,
    );
    if (bottomResult.intersects) {
      result.push(bottomResult.point!);
    }
    const leftResult = line.getIntersectingWithVerticalLine(
      this.location.x,
      this.bottom,
      this.top,
    );
    if (leftResult.intersects) {
      result.push(leftResult.point!);
    }
    const rightResult = line.getIntersectingWithVerticalLine(
      this.location.x + this.size.x,
      this.bottom,
      this.top,
    );
    if (rightResult.intersects) {
      result.push(rightResult.point!);
    }

    return result;
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
  public isPointIn(point: Vector): boolean {
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

  /**
   * 返回一个线段和这个矩形的交点，如果没有交点，就返回这个矩形的中心点
   * 请确保线段和矩形只有一个交点，出现两个交点的情况还未测试
   */
  public getLineIntersectionPoint(line: Line) {
    const topLine = new Line(
      this.location,
      this.location.add(new Vector(this.size.x, 0)),
    );
    const topIntersection = topLine.getIntersection(line);
    if (topIntersection) {
      return topIntersection;
    }
    const bottomLine = new Line(
      this.location.add(new Vector(0, this.size.y)),
      this.location.add(this.size),
    );
    const bottomIntersection = bottomLine.getIntersection(line);
    if (bottomIntersection) {
      return bottomIntersection;
    }
    const leftLine = new Line(
      this.location,
      this.location.add(new Vector(0, this.size.y)),
    );
    const leftIntersection = leftLine.getIntersection(line);
    if (leftIntersection) {
      return leftIntersection;
    }
    const rightLine = new Line(
      this.location.add(new Vector(this.size.x, 0)),
      this.location.add(this.size),
    );
    const rightIntersection = rightLine.getIntersection(line);
    if (rightIntersection) {
      return rightIntersection;
    }
    return this.getCenter();
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
