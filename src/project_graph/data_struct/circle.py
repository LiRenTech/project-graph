from project_graph.data_struct.arrow import SignArrow, SolidArrow
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from PyQt5.QtGui import QPainterPath


class Circle:
    def __init__(self, center: NumberVector, radius: float):
        self.center = center
        self.radius = radius


class LoopCircle:
    """自环"""

    def __init__(self, center: NumberVector, radius: float):
        rect = Rectangle(
            center - NumberVector(radius + 15, radius), 2 * radius, 2 * radius
        )
        self.path = QPainterPath()
        start_angle = 0.5  # 为了防止和重叠的节点多出来的一点，不要从0出发
        self.path.arcMoveTo(rect.to_qt(), start_angle)
        self.path.arcTo(rect.to_qt(), start_angle, 270)
        self.arrow = SolidArrow(NumberVector(1, 0), center + NumberVector(0, radius))
