from data_struct.number_vector import NumberVector


class Line:
    def __init__(self, start: NumberVector, end: NumberVector):
        self.start = start
        self.end = end

    def __repr__(self) -> str:
        return f"Line({self.start}, {self.end})"

    def length(self) -> float:
        return (self.end - self.start).magnitude()

    def direction(self) -> NumberVector:
        return self.end - self.start

    def is_parallel(self, other: 'Line') -> bool:
        """判断两条线段是否平行"""
        return self.direction().cross(other.direction()) == 0

    def is_collinear(self, other: 'Line') -> bool:
        """判断两条线段是否共线"""
        return self.is_parallel(other) and (self.start - other.start).cross(self.direction()) == 0

    def is_intersecting(self, other: 'Line') -> bool:
        """判断两条线段是否相交"""
        if self.is_collinear(other):
            return False

        def on_segment(p: NumberVector, q: NumberVector, r: NumberVector) -> bool:
            return (
                    max(p.x, r.x) >= q.x >= min(p.x, r.x) and
                    max(p.y, r.y) >= q.y >= min(p.y, r.y)
            )

        def orientation(p: NumberVector, q: NumberVector, r: NumberVector) -> int:
            val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
            if val == 0:
                return 0
            return 1 if val > 0 else 2

        o1 = orientation(self.start, self.end, other.start)
        o2 = orientation(self.start, self.end, other.end)
        o3 = orientation(other.start, other.end, self.start)
        o4 = orientation(other.start, other.end, self.end)

        if o1 != o2 and o3 != o4:
            return True

        if o1 == 0 and on_segment(self.start, other.start, self.end):
            return True

        if o2 == 0 and on_segment(self.start, other.end, self.end):
            return True

        if o3 == 0 and on_segment(other.start, self.start, other.end):
            return True

        if o4 == 0 and on_segment(other.start, self.end, other.end):
            return True

        return False

    def cross(self, other: 'Line') -> float:
        """计算两条线段方向向量的叉积"""
        return self.direction().cross(other.direction())

    def get_intersection(self, other: 'Line') -> NumberVector | None:
        """
        计算两条线段的交点
        """
        if not self.is_intersecting(other):
            return None
        try:
            print("get_intersection", self.start, self.end, other.start, other.end)
            x1, y1 = self.start.x, self.start.y
            x2, y2 = self.end.x, self.end.y
            x3, y3 = other.start.x, other.start.y
            x4, y4 = other.end.x, other.end.y

            denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
            if denom == 0:
                return None

            t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
            u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

            if 0 <= t <= 1 and 0 <= u <= 1:
                intersection_x = x1 + t * (x2 - x1)
                intersection_y = y1 + t * (y2 - y1)
                return NumberVector(intersection_x, intersection_y)
            else:
                return None
        except ZeroDivisionError:
            print("ZeroDivisionError")
            return None
        except Exception as e:
            print(e)
            return None
