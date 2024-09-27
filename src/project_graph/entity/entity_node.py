import math
from time import time_ns
from typing import List
from uuid import uuid4

from PyQt5.QtGui import QColor

from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity import Entity
from project_graph.log_utils import log
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext
from project_graph.settings.style_service import STYLE_SERVICE
from project_graph.tools.string_tools import get_size_by_text


class EntityNode(Entity):
    FONT_SIZE = 20
    """字体大小, 不是像素"""

    FONT_DETAIL_SIZE = 16
    """详细文字字体大小"""

    PADDING = 20
    """内边距，像素"""

    def __init__(self, body_shape):
        super().__init__(body_shape)
        self.children: list["EntityNode"] = []

        self._inner_text = "..."

        self.details = ""
        """节点详细文字"""
        self.is_detail_show = False
        """是否显示详细文字"""

        self.uuid = str(uuid4())
        """节点的唯一标识符"""

        self.is_selected = False
        """是否是被选中的状态, 包括框选"""

        self.is_collapsed = False
        """是否是折叠状态"""

        self.is_hidden_by_collapse = False
        """是否是由于父节点的折叠而被隐藏了"""

        self.is_ai_generating = False
        """当前节点是否正在被AI生成内容"""

        self.is_color_set_by_user = False
        """是否是用户手动设置了颜色"""

        self.user_color = QColor(0, 0, 0)
        """用户手动设置的颜色"""

        self.adjust_size_by_text()
        pass

    @property
    def inner_text(self) -> str:
        return self._inner_text

    @inner_text.setter
    def inner_text(self, value: str):
        self._inner_text = value
        self.adjust_size_by_text()

    def clone(self):
        """
        克隆一个节点
        但不会和以前的节点连接
        也就是会丢失children
        """
        res = EntityNode(self.body_shape.clone())
        res.inner_text = self.inner_text
        res.details = self.details

        return res

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
            "details": self.details,
            "children": [child.uuid for child in self.children],
            "uuid": self.uuid,
            "is_collapsed": self.is_collapsed,
            "is_hidden_by_collapse": self.is_hidden_by_collapse,
            "is_color_set_by_user": self.is_color_set_by_user,
            "user_color": [
                self.user_color.red(),
                self.user_color.green(),
                self.user_color.blue(),
            ],
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
            log("cannot add self as child")
            return False
        # 增加之前先看看是否已经有了
        if entity_node in self.children:
            log("already has this child")
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

    # 颜色反色逻辑
    def _color_invert(self, color: QColor) -> QColor:
        """
        计算背景色的亮度 更精确的人眼感知亮度公式 0.2126 * R + 0.7152 * G + 0.0722 * B ，如果亮度较高，则使用黑色文字，
        如果亮度较低，则使用白色文字。这种方法能够确保无论背景色如何变化，文字都能保持足够的对比度。
        """
        r, g, b = color.red(), color.green(), color.blue()
        brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if brightness > 128:
            return QColor(0, 0, 0)
        else:
            return QColor(255, 255, 255)

    def paint(self, context: PaintContext):
        # context.painter.q_painter().setTransform(
        #     context.camera.get_world2view_transform()
        # )
        if self.is_hidden_by_collapse:
            return

        # 绘制节点矩形
        PainterUtils.paint_rect(
            context.painter.q_painter(),
            context.camera.location_world2view(self.body_shape.location_left_top),
            context.camera.current_scale * self.body_shape.width,
            context.camera.current_scale * self.body_shape.height,
            self.user_color
            if self.is_color_set_by_user
            else STYLE_SERVICE.style.node_fill_color,
            STYLE_SERVICE.style.node_border_color,
            (context.camera.current_scale * 3),
            context.camera.current_scale * 16,
        )
        if context.camera.current_scale > 0.1:
            # 此判断用于：太小了的时候不渲染文字
            PainterUtils.paint_text_from_center(
                context.painter.q_painter(),
                context.camera.location_world2view(self.body_shape.center),
                self.inner_text,
                context.camera.current_scale * self.FONT_SIZE,
                self._color_invert(self.user_color)
                if self.is_color_set_by_user
                else STYLE_SERVICE.style.node_text_color,
            )
            if self.is_detail_show:
                PainterUtils.paint_document_from_left_top(
                    context.painter.q_painter(),
                    context.camera.location_world2view(
                        self.body_shape.location_left_top
                        + NumberVector(0, self.body_shape.height)
                    ),
                    self.details,
                    context.camera.current_scale * 400,
                    context.camera.current_scale * 15,
                    STYLE_SERVICE.style.node_details_text_color,
                    QColor(0, 0, 0, 128),
                )
        if self.is_selected:
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.camera.location_world2view(
                    self.body_shape.location_left_top - NumberVector(10, 10)
                ),
                context.camera.current_scale * (self.body_shape.width + 20),
                context.camera.current_scale * (self.body_shape.height + 20),
                QColor(0, 0, 0, 0),
                STYLE_SERVICE.style.node_selected_border_color,
                (context.camera.current_scale * 3),
                context.camera.current_scale * 20,
            )
        if self.is_ai_generating:
            # 画一个左上角圆圈
            color = QColor(
                255, 255, 255, int(math.sin(time_ns() / 100000000) * 128 + 128)
            )
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.camera.location_world2view(self.body_shape.location_left_top),
                context.camera.current_scale * 30,
                context.camera.current_scale * 30,
                color,
                QColor(0, 0, 0, 0),
                0,
                context.camera.current_scale * 15,
            )
            pass
        # 绘制折叠按钮 折叠后节点本身右上角显示一个 “+”
        collapse_box = self.collapse_box

        if self.is_collapsed:
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.camera.location_world2view(collapse_box.location_left_top),
                context.camera.current_scale * collapse_box.width,
                context.camera.current_scale * collapse_box.height,
                STYLE_SERVICE.style.node_fill_color,
                QColor(0, 0, 0, 0),
                0,
                context.camera.current_scale * 15,
            )
            PainterUtils.paint_text_from_center(
                context.painter.q_painter(),
                context.camera.location_world2view(collapse_box.center),
                "+",
                context.camera.current_scale * self.FONT_SIZE,
                self._color_invert(self.user_color)
                if self.is_color_set_by_user
                else STYLE_SERVICE.style.node_text_color,
            )
        # context.painter.q_painter().resetTransform()
        pass

    @property
    def collapse_box(self) -> Rectangle:
        """获取折叠按钮的矩形"""
        return Rectangle(
            self.body_shape.location_left_top
            + NumberVector(self.body_shape.width, 0)
            - NumberVector(30, 30),
            60,
            60,
        )
        pass

    def __repr__(self):
        return f"{self.uuid[-4:]}"
