from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.number_vector import NumberVector


class SolidArrow:
    """实心箭头，有点像中国航天那个图标"""

    def __init__(
        self, direction: NumberVector, point_at: NumberVector, arrow_size: float = 30
    ):
        """
        :direction: 非零向量即可，不需要归一化
        :point_at: 箭头的那个尖尖所在的点
        """
        self.direction = direction

        self.point_at = point_at
        self.path = QPainterPath(point_at.to_qt())
        nor = direction.normalize()
        self.path.lineTo((point_at - nor.rotate(20) * arrow_size).to_qt())
        self.path.lineTo((point_at - nor * (arrow_size / 2)).to_qt())
        self.path.lineTo((point_at - nor.rotate(-20) * arrow_size).to_qt())
        self.path.closeSubpath()


class SignArrow:
    """符号箭头，像一个大于号"""

    def __init__(
        self, direction: NumberVector, point_at: NumberVector, arrow_size: float = 30
    ):
        nor = direction.normalize()
        self.path = QPainterPath((point_at - nor.rotate(45) * arrow_size).to_qt())
        self.path.lineTo(point_at.to_qt())
        self.path.lineTo((point_at - nor.rotate(-45) * arrow_size).to_qt())
