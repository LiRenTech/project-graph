import { Vector } from "../Vector";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export interface IntersectionResult {
  intersects: boolean;
  point?: Vector; // 使用可选属性来表示当没有交点时的情况
}

/**
 * 线段类
 */
export class Line extends Shape {
  start: Vector;
  end: Vector;

  constructor(start: Vector, end: Vector) {
    super();
    this.start = start;
    this.end = end;
  }

  toString(): string {
    return `Line(${this.start}, ${this.end})`;
  }

  length(): number {
    return this.end.subtract(this.start).magnitude();
  }

  midPoint(): Vector {
    return new Vector((this.start.x + this.end.x) / 2, (this.start.y + this.end.y) / 2);
  }

  direction(): Vector {
    return this.end.subtract(this.start);
  }

  /**
   * 判断点是否在线段附近
   * @param point
   * @param tolerance 附近容错度
   */
  isPointNearLine(point: Vector, tolerance: number = 5): boolean {
    const lineVector = this.direction();
    const pointVector = point.subtract(this.start);

    const lineLengthSquared = lineVector.dot(lineVector);

    if (lineLengthSquared === 0) {
      // 线段的起点和终点重合
      return this.start.subtract(point).magnitude() <= tolerance;
    }

    // 计算投影点在线段上的位置
    const t = pointVector.dot(lineVector) / lineLengthSquared;

    // 限制投影点在0到1的范围内
    const nearestPoint =
      t < 0
        ? this.start
        : t > 1
          ? this.end
          : new Vector(this.start.x + t * lineVector.x, this.start.y + t * lineVector.y);

    // 检查该点到line的距离是否在容差范围内
    return nearestPoint.subtract(point).magnitude() <= tolerance;
  }

  isPointIn(point: Vector): boolean {
    return this.isPointNearLine(point);
  }

  isCollideWithRectangle(rectangle: Rectangle): boolean {
    return rectangle.isCollideWithLine(this);
  }

  isCollideWithLine(line: Line): boolean {
    return this.isIntersecting(line);
  }

  isParallel(other: Line): boolean {
    /** 判断两条线段是否平行 */
    return this.direction().cross(other.direction()) === 0;
  }

  isCollinear(other: Line): boolean {
    /** 判断两条线段是否共线 */
    return this.isParallel(other) && this.start.subtract(other.start).cross(this.direction()) === 0;
  }

  /**
   * 判断该线段是否和一个水平的线段相交
   * @param y 水平线段的y坐标
   * @param xLeft 水平线段的左端点
   * @param xRight 水平线段的右端点
   */
  isIntersectingWithHorizontalLine(y: number, xLeft: number, xRight: number): boolean {
    // 如果线段两端点的y坐标都在水平线的同一侧，则不可能相交
    if ((this.start.y - y) * (this.end.y - y) > 0) {
      return false;
    }

    // 如果线段的一个端点恰好位于水平线上，则视为相交
    if (this.start.y === y || this.end.y === y) {
      return true;
    }

    // 计算线段在y轴方向上的变化率（斜率）
    const slope = (this.end.x - this.start.x) / (this.end.y - this.start.y);

    // 计算线段与水平线的交点的x坐标
    const intersectionX = this.start.x + slope * (y - this.start.y);

    // 检查交点的x坐标是否在水平线段的范围内
    return intersectionX >= Math.min(xLeft, xRight) && intersectionX <= Math.max(xLeft, xRight);
  }

  getRectangle(): Rectangle {
    const minX = Math.min(this.start.x, this.end.x);
    const maxX = Math.max(this.start.x, this.end.x);
    const minY = Math.min(this.start.y, this.end.y);
    const maxY = Math.max(this.start.y, this.end.y);
    const location = new Vector(minX, minY);
    const size = new Vector(maxX - minX, maxY - minY);
    return new Rectangle(location, size);
  }

  /**
   * 判断该线段是否和一个垂直的线段相交
   * @param x 垂直线段的x坐标
   * @param yBottom 垂直线段的下端点
   * @param yTop 垂直线段的上端点
   */
  isIntersectingWithVerticalLine(x: number, yBottom: number, yTop: number): boolean {
    // 如果线段两端点的x坐标都在垂直线的同一侧，则不可能相交
    if ((this.start.x - x) * (this.end.x - x) > 0) {
      return false;
    }

    // 如果线段的一个端点恰好位于垂直线上，则视为相交
    if (this.start.x === x || this.end.x === x) {
      return true;
    }

    // 计算线段在x轴方向上的变化率（倒数斜率）
    const inverseSlope = (this.end.y - this.start.y) / (this.end.x - this.start.x);

    // 计算线段与垂直线的交点的y坐标
    const intersectionY = this.start.y + inverseSlope * (x - this.start.x);

    // 检查交点的y坐标是否在垂直线段的范围内
    return intersectionY >= Math.min(yBottom, yTop) && intersectionY <= Math.max(yBottom, yTop);
  }
  // 更新 isIntersectingWithHorizontalLine 方法
  getIntersectingWithHorizontalLine(y: number, xLeft: number, xRight: number): IntersectionResult {
    // 如果线段两端点的y坐标都在水平线的同一侧，则不可能相交
    if ((this.start.y - y) * (this.end.y - y) > 0) {
      return { intersects: false };
    }

    // 如果线段的一个端点恰好位于水平线上，则视为相交
    if (this.start.y === y || this.end.y === y) {
      return { intersects: true, point: new Vector(this.start.x, y) };
    }

    // 计算线段在y轴方向上的变化率（斜率）
    const slope = (this.end.x - this.start.x) / (this.end.y - this.start.y);

    // 计算线段与水平线的交点的x坐标
    const intersectionX = this.start.x + slope * (y - this.start.y);

    // 检查交点的x坐标是否在水平线段的范围内
    if (intersectionX >= Math.min(xLeft, xRight) && intersectionX <= Math.max(xLeft, xRight)) {
      return { intersects: true, point: new Vector(intersectionX, y) };
    }

    return { intersects: false };
  }

  // 更新 isIntersectingWithVerticalLine 方法
  getIntersectingWithVerticalLine(x: number, yBottom: number, yTop: number): IntersectionResult {
    // 如果线段两端点的x坐标都在垂直线的同一侧，则不可能相交
    if ((this.start.x - x) * (this.end.x - x) > 0) {
      return { intersects: false };
    }

    // 如果线段的一个端点恰好位于垂直线上，则视为相交
    if (this.start.x === x || this.end.x === x) {
      return { intersects: true, point: new Vector(x, this.start.y) };
    }

    // 计算线段在x轴方向上的变化率（倒数斜率）
    const inverseSlope = (this.end.y - this.start.y) / (this.end.x - this.start.x);

    // 计算线段与垂直线的交点的y坐标
    const intersectionY = this.start.y + inverseSlope * (x - this.start.x);

    // 检查交点的y坐标是否在垂直线段的范围内
    if (intersectionY >= Math.min(yBottom, yTop) && intersectionY <= Math.max(yBottom, yTop)) {
      return { intersects: true, point: new Vector(x, intersectionY) };
    }

    return { intersects: false };
  }

  isIntersectingWithCircle(circle: Circle): boolean {
    const A = this.start.y - this.end.y;
    const B = this.end.x - this.start.x;
    const C = this.start.x * this.end.y - this.end.x * this.start.y;
    // 使用距离公式判断圆心到直线ax+by+c=0的距离是否大于半径
    let dist1 = A * circle.location.x + B * circle.location.y + C;
    dist1 *= dist1;
    const dist2 = (A * A + B * B) * circle.radius * circle.radius;
    if (dist1 > dist2) {
      // 圆心到直线p1p2的距离大于半径，不相交
      return false;
    }
    const angle1 =
      (circle.location.x - this.start.x) * (this.end.x - this.start.x) +
      (circle.location.y - this.start.y) * (this.end.y - this.start.y);
    const angle2 =
      (circle.location.x - this.end.x) * (this.start.x - this.end.x) +
      (circle.location.y - this.end.y) * (this.start.y - this.end.y);
    // 余弦为正，则是锐角，一定相交
    return angle1 > 0 && angle2 > 0;
  }
  /**
   * 判断两条线段是否相交
   */
  isIntersecting(other: Line): boolean {
    if (this.isCollinear(other)) {
      return false;
    }

    const onSegment = (p: Vector, q: Vector, r: Vector): boolean => {
      return (
        Math.max(p.x, r.x) >= q.x && q.x >= Math.min(p.x, r.x) && Math.max(p.y, r.y) >= q.y && q.y >= Math.min(p.y, r.y)
      );
    };

    const orientation = (p: Vector, q: Vector, r: Vector): number => {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
      if (val === 0) return 0;
      return val > 0 ? 1 : 2;
    };

    const o1 = orientation(this.start, this.end, other.start);
    const o2 = orientation(this.start, this.end, other.end);
    const o3 = orientation(other.start, other.end, this.start);
    const o4 = orientation(other.start, other.end, this.end);

    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    if (o1 === 0 && onSegment(this.start, other.start, this.end)) {
      return true;
    }

    if (o2 === 0 && onSegment(this.start, other.end, this.end)) {
      return true;
    }

    if (o3 === 0 && onSegment(other.start, this.start, other.end)) {
      return true;
    }

    if (o4 === 0 && onSegment(other.start, this.end, other.end)) {
      return true;
    }

    return false;
  }

  cross(other: Line): number {
    /** 计算两条线段方向向量的叉积 */
    return this.direction().cross(other.direction());
  }

  getIntersection(other: Line): Vector | null {
    /**
     * 计算两条线段的交点
     */
    if (!this.isIntersecting(other)) {
      return null;
    }
    try {
      const x1 = this.start.x,
        y1 = this.start.y;
      const x2 = this.end.x,
        y2 = this.end.y;
      const x3 = other.start.x,
        y3 = other.start.y;
      const x4 = other.end.x,
        y4 = other.end.y;

      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (denom === 0) {
        return null;
      }

      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        const intersectionX = x1 + t * (x2 - x1);
        const intersectionY = y1 + t * (y2 - y1);
        return new Vector(intersectionX, intersectionY);
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
