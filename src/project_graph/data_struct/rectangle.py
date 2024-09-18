from typing import Any

from PyQt5.QtCore import QRectF

from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.logging import log


class Rectangle:
    def __init__(self, location_left_top: NumberVector, width: float, height: float):
        self.location_left_top = location_left_top.clone()
        self.width: float = width
        self.height: float = height
        # 处理负数情况
        if self.width < 0.0:
            # 把x坐标减去width的绝对值
            self.location_left_top.x += self.width
            # 把width设置为绝对值
            self.width = abs(width)
        if self.height < 0.0:
            # 同理
            self.location_left_top.y += self.height
            self.height = abs(height)

    def output_data(self) -> dict[str, Any]:
        return {
            "width": self.width,
            "height": self.height,
            "locationLeftTop": [self.location_left_top.x, self.location_left_top.y],
        }

    def read_data(self, data: dict[str, Any]):
        if "width" not in data or "height" not in data or "locationLeftTop" not in data:
            raise ValueError("bodyShape 更新失败，缺少必要参数")
        self.width = data["width"]
        self.height = data["height"]
        self.location_left_top = NumberVector(
            data["locationLeftTop"][0], data["locationLeftTop"][1]
        )

    def __str__(self) -> str:
        return f"Rectangle({self.location_left_top}, {self.width}, {self.height})"

    def __contains__(self, item: NumberVector) -> bool:
        return (
            self.location_left_top.x <= item.x <= self.location_left_top.x + self.width
        ) and (
            self.location_left_top.y <= item.y <= self.location_left_top.y + self.height
        )

    def clone(self) -> "Rectangle":
        return Rectangle(self.location_left_top.clone(), self.width, self.height)

    def right(self):
        """返回最右侧的x坐标

        Returns:
            float: 最右侧x坐标
        """
        return self.location_left_top.x + self.width

    def left(self):
        return self.location_left_top.x

    def top(self):
        return self.location_left_top.y

    def bottom(self):
        return self.location_left_top.y + self.height

    @staticmethod
    def from_edges(left: float, top: float, right: float, bottom: float) -> "Rectangle":
        """通过四条边来创建矩形"""
        return Rectangle(NumberVector(left, top), right - left, bottom - top)

    @staticmethod
    def from_two_points(p1: NumberVector, p2: NumberVector) -> "Rectangle":
        """通过两个点来创建矩形，可以用于框选生成矩形"""
        left = min(p1.x, p2.x)
        top = min(p1.y, p2.y)
        right = max(p1.x, p2.x)
        bottom = max(p1.y, p2.y)
        return Rectangle(NumberVector(left, top), right - left, bottom - top)

    @staticmethod
    def get_bounding_rectangle(rectangles: list["Rectangle"]) -> "Rectangle":
        if not rectangles:
            raise ValueError("矩形列表不能为空")

        left = min(rect.location_left_top.x for rect in rectangles)
        top = min(rect.location_left_top.y for rect in rectangles)
        right = max(rect.location_left_top.x + rect.width for rect in rectangles)
        bottom = max(rect.location_left_top.y + rect.height for rect in rectangles)

        return Rectangle.from_edges(left, top, right, bottom)

    def get_fore_points(self) -> list[NumberVector]:
        return [
            NumberVector(self.location_left_top.x, self.location_left_top.y),
            NumberVector(
                self.location_left_top.x + self.width, self.location_left_top.y
            ),
            NumberVector(
                self.location_left_top.x + self.width,
                self.location_left_top.y + self.height,
            ),
            NumberVector(
                self.location_left_top.x, self.location_left_top.y + self.height
            ),
        ]

    @property
    def center(self) -> NumberVector:
        return NumberVector(
            self.location_left_top.x + self.width / 2,
            self.location_left_top.y + self.height / 2,
        )

    @property
    def left_center(self) -> NumberVector:
        return NumberVector(self.location_left_top.x, self.center.y)

    @property
    def right_center(self) -> NumberVector:
        return NumberVector(self.location_left_top.x + self.width, self.center.y)

    @property
    def right_bottom(self) -> NumberVector:
        return NumberVector(
            self.location_left_top.x + self.width,
            self.location_left_top.y + self.height,
        )

    @property
    def top_center(self) -> NumberVector:
        return NumberVector(self.center.x, self.location_left_top.y)

    @property
    def bottom_center(self) -> NumberVector:
        return NumberVector(self.center.x, self.location_left_top.y + self.height)

    def expand_from_center(self, delta_x: float, delta_y: float) -> "Rectangle":
        """以中心点为中心，扩展矩形"""
        return Rectangle(
            NumberVector(
                self.location_left_top.x - delta_x, self.location_left_top.y - delta_y
            ),
            self.width + 2 * delta_x,
            self.height + 2 * delta_y,
        )

    def is_collision(self, rect: "Rectangle", margin: float = 0) -> bool:
        """判断self是否与rect之间的最小边距小于margin。
        当margin=0时，此时为判断self与rect是否重叠

        Args:
            rect (Rectangle): 待判断的矩形
            margin (float, optional): 判断的边距，当边距等于0时，为碰撞检测. Defaults to 0.

        Returns:
            bool: self是否与rect之间的最小边距小于margin
        """
        collision_x = (
            self.right() - rect.left() > -margin
            and rect.right() - self.left() > -margin
        )
        collision_y = (
            self.bottom() - rect.top() > -margin
            and rect.bottom() - self.top() > -margin
        )
        return collision_x and collision_y

    def is_contain(self, rect: "Rectangle") -> bool:
        """判断是否包含另一个矩形，另一个矩形是否被套在自己内部"""
        return (
            self.left() <= rect.left()
            and self.right() >= rect.right()
            and self.top() <= rect.top()
            and self.bottom() >= rect.bottom()
        )

    def is_contain_point(self, point: NumberVector) -> bool:
        """判断是否包含点"""
        return (
            self.left() <= point.x <= self.right()
            and self.top() <= point.y <= self.bottom()
        )

    def __repr__(self):
        return f"Rectangle({self.location_left_top}, {self.width}, {self.height})"

    def is_intersect_with_line(self, line: Line) -> bool:
        """判断线段是否与矩形相交"""
        # 遍历自己的上下左右四个边，看是否有交点
        top_line = Line(self.location_left_top, NumberVector(self.right(), self.top()))
        if top_line.is_intersecting(line):
            return True

        bottom_line = Line(
            NumberVector(self.left(), self.bottom()),
            NumberVector(self.right(), self.bottom()),
        )
        if bottom_line.is_intersecting(line):
            return True

        left_line = Line(
            self.location_left_top, NumberVector(self.left(), self.bottom())
        )
        if left_line.is_intersecting(line):
            return True

        right_line = Line(
            NumberVector(self.right(), self.top()),
            NumberVector(self.right(), self.bottom()),
        )
        if right_line.is_intersecting(line):
            return True

        return False

    def get_line_intersection_point(self, line: Line) -> NumberVector:
        """
        返回一个线段和这个矩形的交点，如果没有交点，就返回这个矩形的中心点
        请确保线段和矩形只有一个交点，出现两个交点的情况还未测试
        :param line:
        :return:
        """
        # 遍历自己的上下左右四个边，看是否有交点
        top_line = Line(self.location_left_top, NumberVector(self.right(), self.top()))
        top_intersection = top_line.get_intersection(line)
        if top_intersection is not None:
            return top_intersection

        bottom_line = Line(
            NumberVector(self.left(), self.bottom()),
            NumberVector(self.right(), self.bottom()),
        )

        bottom_intersection = bottom_line.get_intersection(line)
        if bottom_intersection is not None:
            return bottom_intersection

        left_line = Line(
            self.location_left_top, NumberVector(self.left(), self.bottom())
        )

        left_intersection = left_line.get_intersection(line)
        if left_intersection is not None:
            return left_intersection

        right_line = Line(
            NumberVector(self.right(), self.top()),
            NumberVector(self.right(), self.bottom()),
        )

        right_intersection = right_line.get_intersection(line)
        if right_intersection is not None:
            return right_intersection

        return self.center

    def get_normal_from_center_to_edge(self, point: NumberVector) -> NumberVector:
        """如果point在这个矩形的四条边的某一条上，则返回从中心指向该边中点的单位向量。否则返回0向量"""
        if (
            point.x < self.left()
            or point.x > self.right()
            or point.y < self.top()
            or point.y > self.bottom()
        ):
            return NumberVector.zero()
        if point.x == self.left():
            return NumberVector(-1, 0)
        elif point.x == self.right():
            return NumberVector(1, 0)
        elif point.y == self.top():
            return NumberVector(0, -1)
        elif point.y == self.bottom():
            return NumberVector(0, 1)
        return NumberVector.zero()

    def to_qt(self) -> QRectF:
        return QRectF(
            self.location_left_top.x, self.location_left_top.y, self.width, self.height
        )


# test
if __name__ == "__main__":
    r1 = Rectangle(NumberVector(0, 0), 10, 10)
    r2 = Rectangle(NumberVector(5, 5), 10, 10)
    log(r1.is_collision(r2))  # True
    log(r2.is_collision(r1))  # True
    log(r1.center)  # (5, 5)
