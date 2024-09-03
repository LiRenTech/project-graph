from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.arrow import Arrow
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle


def bezier_curve(
    start: NumberVector, ctrl1: NumberVector, ctrl2: NumberVector, end: NumberVector
) -> QPainterPath:
    path = QPainterPath(start.to_qt())
    path.cubicTo(ctrl1.to_qt(), ctrl2.to_qt(), end.to_qt())
    return path


class ConnectCurve:
    """
    连接两个矩形的，有方向箭头的 贝塞尔曲线
    """

    def __init__(self, start: Rectangle, end: Rectangle):
        # direction = end.center - start.center
        line = Line(start.center, end.center)
        start_pt = start.get_line_intersection_point(line)
        point_at = end.get_line_intersection_point(line)
        start_normal = start.get_normal_from_center_to_edge(start_pt)
        end_normal = end.get_normal_from_center_to_edge(point_at)
        end_pt = point_at + end_normal * 15
        half = (point_at - start_pt) / 2
        abs_half = NumberVector(abs(half.x), abs(half.y))
        self.path = bezier_curve(
            start_pt,
            start_pt + start_normal * abs_half,
            end_pt + end_normal * abs_half,
            end_pt,
        )
        self.arrow = Arrow(-end_normal, point_at)
        # if abs(direction.x) >= abs(direction.y):
        #     arrow_direction = NumberVector(direction.x, 0).normalize()
        #     point_at = end.center - arrow_direction * (end.width / 2)
        #     self.path = x_symmetry_curve(
        #         start.center + arrow_direction * (start.width / 2),
        #         point_at - arrow_direction * 15,
        #     )
        # else:
        #     arrow_direction = NumberVector(0, direction.y).normalize()
        #     point_at = end.center - arrow_direction * (end.height / 2)
        #     self.path = y_symmetry_curve(
        #         start.center + arrow_direction * (start.height / 2),
        #         point_at - arrow_direction * 15,
        #     )
        # self.path = QPainterPath(start.to_qt())
        # diff = end - start
        # if abs(diff.x) >= abs(diff.y):
        #     half_x = (end.x - start.x) / 2
        #     if half_x == 0:
        #         dist = NumberVector.zero()
        #     else:
        #         dist = NumberVector(half_x / abs(half_x) * 15, 0)
        #     ctrl1 = NumberVector(start.x + half_x, start.y)
        #     ctrl2 = NumberVector(end.x - half_x, end.y)
        # else:
        #     half_y = (end.y - start.y) / 2
        #     if half_y == 0:
        #         dist = NumberVector.zero()
        #     else:
        #         dist = NumberVector(0, half_y / abs(half_y) * 15)
        #     ctrl1 = NumberVector(start.x, start.y + half_y)
        #     ctrl2 = NumberVector(end.x, end.y - half_y)

        # self.path.cubicTo(ctrl1.to_qt(), ctrl2.to_qt(), (end - dist).to_qt())
