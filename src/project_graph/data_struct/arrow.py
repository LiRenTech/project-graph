from PyQt5.QtGui import QPainterPath

from project_graph.data_struct.number_vector import NumberVector


class Arrow:
    def __init__(self, direction: NumberVector, point_at: NumberVector):
        """
        :direction: 非零向量即可，不需要归一化
        :point_at: 箭头的那个尖尖所在的点
        """
        self.direction = direction

        self.point_at = point_at
        self.path = QPainterPath(point_at.to_qt())
        arrow_size = 30
        nor = direction.normalize()
        self.path.lineTo((point_at - nor.rotate(20) * arrow_size).to_qt())
        self.path.lineTo((point_at - nor * 15).to_qt())
        self.path.lineTo((point_at - nor.rotate(-20) * arrow_size).to_qt())
        self.path.closeSubpath()
