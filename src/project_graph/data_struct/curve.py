from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.arrow import SolidArrow
from project_graph.data_struct.circle import LoopCircle
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
        if start == end:
            loop = LoopCircle(start.location_left_top, 40)
            self.path = loop.path
            self.arrow = loop.arrow
            return
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
        self.arrow = SolidArrow(-end_normal, point_at)
