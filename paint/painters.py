from PyQt5.QtCore import QRectF, QPointF
from PyQt5.QtGui import QPainter

from data_struct.rectangle import Rectangle
from data_struct.text import Text


# 施工中...
class ProjectGraphPainter:
    def __init__(self, painter: QPainter):
        self._painter = painter

    def q_painter(self) -> QPainter:
        return self._painter

    def paint_rect(self, rect: Rectangle):
        self._painter.drawRect(
            QRectF(
                rect.location_left_top.x,
                rect.location_left_top.y,
                rect.width,
                rect.height,
            )
        )

    def paint_text(self, text: Text):
        ascent = self._painter.fontMetrics().ascent()
        self._painter.drawText(
            QPointF(text.left_top.x, text.left_top.y + ascent), text.text
        )

    def paint_text_in_rect(self, str_text: str, rect: Rectangle):
        """
        绘制文本，使得文本中心居中在矩形框内
        :param str_text: 文本内容
        :param rect: 矩形框
        """
        ascent = self._painter.fontMetrics().ascent()
        text_width = self._painter.fontMetrics().width(str_text)
        text_height = self._painter.fontMetrics().height()
        self._painter.drawText(
            QPointF(
                rect.location_left_top.x + (rect.width - text_width) / 2,
                rect.location_left_top.y + (rect.height - text_height) / 2 + ascent,
            ),
            str_text
        )
