"""
此模块中存放一些具体的效果实现
"""

from typing import List

from PyQt5.QtGui import QColor

from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.effect.effect import Effect
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext


class EffectCuttingFlash(Effect):
    """
    切割闪烁效果
    """

    def __init__(self, duration: int, line: Line):
        super().__init__(duration)
        self.line = line

    def paint(self, context: PaintContext):
        # 外部粗线
        PainterUtils.paint_solid_line(
            context.painter.q_painter(),
            context.camera.location_world2view(self.line.start),
            context.camera.location_world2view(self.line.end),
            QColor(218, 112, 214, int((1 - self.finish_rate) * 255)),
            int(50 * self.finish_rate),
        )
        # 内部细线
        PainterUtils.paint_solid_line(
            context.painter.q_painter(),
            context.camera.location_world2view(self.line.start),
            context.camera.location_world2view(self.line.end),
            QColor(255, 0, 0, int((1 - self.finish_rate) * 255)),
            int(10 * self.finish_rate),
        )

    def get_components(self) -> List[Paintable]:
        return []


class EffectRectangleFlash(Effect):
    """
    矩形闪烁效果
    """

    def __init__(self, duration: int, rect: Rectangle):
        super().__init__(duration)
        self.rect = rect

    def get_components(self) -> List[Paintable]:
        return []

    def tick(self):
        super().tick()
        self.rect.location_left_top += NumberVector(-1, -1)
        self.rect.width += 2
        self.rect.height += 2

    def paint(self, context: PaintContext):
        PainterUtils.paint_rect(
            context.painter.q_painter(),
            context.camera.location_world2view(self.rect.location_left_top),
            context.camera.current_scale * self.rect.width,
            context.camera.current_scale * self.rect.height,
            QColor(156, 220, 254, int((1 - self.finish_rate) * 255)),
            QColor(86, 156, 214, int((1 - self.finish_rate) * 255)),
            int(10 * self.finish_rate),
        )


class EffectRectangleShrink(Effect):
    """
    矩形缩小效果
    """

    def __init__(self, duration: int, rect: Rectangle):
        super().__init__(duration)
        self.current_rect = rect

    def get_components(self) -> List[Paintable]:
        return []

    def tick(self):
        super().tick()
        self.current_rect.location_left_top += NumberVector(1, 1)
        self.current_rect.width -= 2
        self.current_rect.height -= 2

    def paint(self, context: PaintContext):
        PainterUtils.paint_rect(
            context.painter.q_painter(),
            context.camera.location_world2view(self.current_rect.location_left_top),
            context.camera.current_scale * self.current_rect.width,
            context.camera.current_scale * self.current_rect.height,
            QColor(31, 31, 31, int((1 - self.finish_rate) * 255)),
            QColor(156, 220, 254, int((1 - self.finish_rate) * 255)),
            int(10 * self.finish_rate),
        )


class EffectCircleExpand(Effect):
    """
    圆圈扩大效果
    """
