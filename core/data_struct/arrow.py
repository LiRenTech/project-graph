from PyQt5.QtGui import QPainterPath

from core.data_struct.number_vector import NumberVector


class Arrow:
    def __init__(self, direction: NumberVector, point_at: NumberVector):
        self.direction = direction
        self.point_at = point_at
        self.path = QPainterPath(point_at.to_qt())
        arrow_size = 30
        nor = direction.normalize()
        self.path.lineTo(
            (point_at - nor.rotate(20) * arrow_size).to_qt()
        )
        self.path.lineTo(
            (point_at - nor * 15).to_qt()
        )
        self.path.lineTo(
            (point_at - nor.rotate(-20) * arrow_size).to_qt()
        )
        self.path.closeSubpath()
        # self.path.moveTo(point_at.to_qt())
