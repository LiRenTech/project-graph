from typing import List
from uuid import uuid4

from PyQt5.QtGui import QPainter, QColor

from core.camera import Camera
from data_struct.number_vector import NumberVector
from data_struct.text import Text
from paint.paint_utils import PainterUtils
from paint.paintables import PaintContext, Paintable
from tools.string_tools import get_size_by_text, get_width_by_file_name
from .entity import Entity


class EntityNode(Entity):
    FONT_SIZE = 20  # 字体大小, 不是像素
    PADDING = 20  # 内边距，像素

    def __init__(self, body_shape):
        super().__init__(body_shape)
        self.children: list["EntityNode"] = []

        self._inner_text = "..."
        self.uuid = str(uuid4())

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

    def dump(self) -> dict:
        """
        转化成字典格式
        """
        return {
            "body_shape": {
                "type": "Rectangle",
                "width": self.body_shape.width,
                "height": self.body_shape.height,
                "location_left_top": [
                    self.body_shape.location_left_top.x,
                    self.body_shape.location_left_top.y,
                ],
            },
            "inner_text": self.inner_text,
            "children": [child.uuid for child in self.children],
            "uuid": self.uuid,
        }

    def adjust_size_by_text(self):
        """
        根据文本内容调整节点大小
        :return:
        """
        width, height, ascent = get_size_by_text(self.FONT_SIZE, self._inner_text)
        self.body_shape.width = width + 2 * self.PADDING
        self.body_shape.height = height + 2 * self.PADDING
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

        # 绘制边框
        PainterUtils.paint_rect_from_left_top(
            context.painter.q_painter(),
            context.camera.location_world2view(self.body_shape.location_left_top),
            self.body_shape.width * context.camera.current_scale,
            self.body_shape.height * context.camera.current_scale,
            QColor(31, 31, 31, 200),
            QColor(23, 159, 255),
            int(2 * context.camera.current_scale),
        )

        PainterUtils.paint_word_from_center(
            context.painter.q_painter(),
            context.camera.location_world2view(self.body_shape.center),
            self.inner_text,
            self.FONT_SIZE * context.camera.current_scale,
            QColor(156, 220, 254),
        )

        if self.is_selected:
            PainterUtils.paint_rect_from_left_top(
                context.painter.q_painter(),
                context.camera.location_world2view(
                    self.body_shape.location_left_top - NumberVector(10, 10)
                ),
                (self.body_shape.width + 20) * context.camera.current_scale,
                (self.body_shape.height + 20) * context.camera.current_scale,
                QColor(0, 0, 0, 0),
                QColor(156, 220, 254),
                int(3 * context.camera.current_scale),
            )
        pass
