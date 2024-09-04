"""
连线
"""

from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.arrow import SolidArrow
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle


def straight_line(start: NumberVector, end: NumberVector) -> QPainterPath:
    path = QPainterPath(start.to_qt())
    path.lineTo(end.to_qt())
    return path


class ConnectStraightLine:
    """
    直接连接两个矩形的直线
    """

    def __init__(self, start: Rectangle, end: Rectangle):
        line = Line(start.center, end.center)
        # 边框上的出发点
        start_pt = start.get_line_intersection_point(line)
        # 边框上的终点
        point_at = end.get_line_intersection_point(line)

        self.path = straight_line(
            start_pt,
            point_at,
        )
        self.arrow = SolidArrow(point_at - start_pt, point_at)

    pass
