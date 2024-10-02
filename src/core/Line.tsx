import { Vector } from "./Vector";

export class Line {
  /**
   * 线段类
   */

  start: Vector;
  end: Vector;

  constructor(start: Vector, end: Vector) {
    this.start = start;
    this.end = end;
  }

  toString(): string {
    return `Line(${this.start}, ${this.end})`;
  }

  length(): number {
    return this.end.subtract(this.start).magnitude();
  }

  midpoint(): Vector {
    return new Vector(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2,
    );
  }

  direction(): Vector {
    return this.end.subtract(this.start);
  }

  isParallel(other: Line): boolean {
    /** 判断两条线段是否平行 */
    return this.direction().cross(other.direction()) === 0;
  }

  isCollinear(other: Line): boolean {
    /** 判断两条线段是否共线 */
    return (
      this.isParallel(other) &&
      this.start.subtract(other.start).cross(this.direction()) === 0
    );
  }

  isIntersecting(other: Line): boolean {
    /** 判断两条线段是否相交 */
    if (this.isCollinear(other)) {
      return false;
    }

    const onSegment = (p: Vector, q: Vector, r: Vector): boolean => {
      return (
        Math.max(p.x, r.x) >= q.x &&
        q.x >= Math.min(p.x, r.x) &&
        Math.max(p.y, r.y) >= q.y &&
        q.y >= Math.min(p.y, r.y)
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
      console.log(e);
      return null;
    }
  }
}
