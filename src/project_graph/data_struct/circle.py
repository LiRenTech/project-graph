from math import sqrt

from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.arrow import SolidArrow
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle


class Circle:
    def __init__(self, center: NumberVector, radius: float):
        self.center = center
        "圆心"
        self.radius = radius

    def intersect_with_line(self, line: Line) -> bool:
        """
        判断圆与直线是否相交
        """
        # 获取圆心坐标
        cx, cy = self.center.x, self.center.y

        # 获取线段的起点和终点坐标
        x1, y1 = line.start.x, line.start.y
        x2, y2 = line.end.x, line.end.y

        # 计算线段的方向向量
        dx = x2 - x1
        dy = y2 - y1

        # 计算圆心到线段起点的向量
        pc = (cx - x1), (cy - y1)

        # 计算投影点到线段起点的向量
        t = (pc[0] * dx + pc[1] * dy) / (dx * dx + dy * dy)

        # 投影点的坐标
        proj_point_x = x1 + t * dx
        proj_point_y = y1 + t * dy

        # 计算圆心到投影点的距离
        distance_squared = (proj_point_x - cx) ** 2 + (proj_point_y - cy) ** 2

        # 检查投影点是否在线段上
        if 0 <= t <= 1:
            # 如果距离小于等于半径，则相交
            return distance_squared <= self.radius**2
        else:
            # 检查线段的端点是否在圆内
            d1 = sqrt((cx - x1) ** 2 + (cy - y1) ** 2)
            d2 = sqrt((cx - x2) ** 2 + (cy - y2) ** 2)
            return d1 <= self.radius or d2 <= self.radius


class LoopCircle:
    """自环"""

    def __init__(self, center: NumberVector, radius: float):
        """
        center: 传入一个矩形的左上角顶点位置
        radius: 半径
        """
        self.radius = radius

        rect = Rectangle(
            center - NumberVector(radius + 15, radius), 2 * radius, 2 * radius
        )
        self.path = QPainterPath()
        start_angle = 0.5  # 为了防止和重叠的节点多出来的一点，不要从0出发
        self.path.arcMoveTo(rect.to_qt(), start_angle)
        self.path.arcTo(rect.to_qt(), start_angle, 270)
        self.arrow = SolidArrow(NumberVector(1, 0), center + NumberVector(0, radius))
