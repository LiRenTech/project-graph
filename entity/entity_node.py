from typing import List
from PyQt5.QtGui import QPainter, QColor

from core.camera import Camera
from data_struct.number_vector import NumberVector
from data_struct.text import Text
from paint.paint_utils import PainterUtils
from paint.paintables import PaintContext, Paintable
from .entity import Entity


class EntityNode(Entity):
    def __init__(self, body_shape):
        super().__init__(body_shape)
        self.children: list["EntityNode"] = []

        self._inner_text = "..."

        # 是否是被选中的状态
        self.is_selected = False
        self.adjust_size_by_text()

    @property
    def inner_text(self) -> str:
        return self._inner_text

    @inner_text.setter
    def inner_text(self, value: str):
        self._inner_text = value
        self.adjust_size_by_text()

    def adjust_size_by_text(self):
        """
        根据文本内容调整节点大小
        :return:
        """
        pass

    def add_child(self, entity_node) -> bool:
        # 不能添加自己作为自己的子节点
        if entity_node is self:
            return False
        # 增加之前先看看是否已经有了
        if entity_node in self.children:
            return False
        self.children.append(entity_node)
        return True

    def remove_child(self, entity_node):
        if entity_node not in self.children:
            return False
        self.children.remove(entity_node)
        return True

    def get_components(self) -> List[Paintable]:
        return super().get_components()

    def paint(self, context: PaintContext):
        location = context.camera.location_world2view(self.body_shape.location_left_top)
        # 绘制边框
        PainterUtils.paint_rect_from_left_top(
            context.painter.q_painter(),
            location,
            self.body_shape.width * context.camera.current_scale,
            self.body_shape.height * context.camera.current_scale,
            QColor(24, 161, 255, 128),
            QColor(106, 203, 255),
            int(1 * context.camera.current_scale),
        )

        # context.painter.paint_rect(
        #     self.body_shape
        # )

        # 绘制文字
        PainterUtils.paint_word_from_left_top(
            context.painter.q_painter(),
            context.camera.location_world2view(self.body_shape.location_left_top),
            self.inner_text,
            20 * context.camera.current_scale,
            QColor(255, 255, 255),
        )

        # context.painter.paint_text(
        #     Text(self.body_shape.location_left_top, self._inner_text)
        # )

        if self.is_selected:
            PainterUtils.paint_rect_from_left_top(
                context.painter.q_painter(),
                context.camera.location_world2view(
                    self.body_shape.location_left_top - NumberVector(10, 10)
                ),
                (self.body_shape.width + 20) * context.camera.current_scale,
                (self.body_shape.height + 20) * context.camera.current_scale,
                QColor(0, 0, 0, 0),
                QColor(106, 203, 255),
                int(3 * context.camera.current_scale),
            )
        pass
