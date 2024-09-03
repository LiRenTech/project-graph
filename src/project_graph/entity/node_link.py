from PyQt5.QtGui import QColor

from project_graph.data_struct.connect_straight_line import ConnectStraightLine
from project_graph.data_struct.curve import ConnectCurve
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity import Entity
from project_graph.entity.entity_node import EntityNode
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.tools.string_tools import get_size_by_text


class NodeLink(Entity):
    """
    连接两个节点的连线
    """

    TEXT_PADDING_X = 20  # 左右各留 20px 的空白
    TEXT_PADDING_Y = 2  # 上下各留 2px 的空白
    TEXT_FONT_SIZE = 18  # 连线上标注的文字字体大小

    def __init__(self, source_node: EntityNode, target_node: EntityNode):
        self.source_node = source_node
        self.target_node = target_node

        self.inner_text = ""
        """连线上标注的文本"""

    def __hash__(self) -> int:
        combine_uuid = self.source_node.uuid + self.target_node.uuid
        return hash(combine_uuid)

    def __eq__(self, other: "NodeLink") -> bool:
        return (
            self.source_node == other.source_node
            and self.target_node == other.target_node
        )

    def __repr__(self) -> str:
        return f"NodeLink({self.source_node}, {self.target_node})"

    @property
    def body_shape(self) -> Line:
        """临时生成，返回一个身体形状线段"""
        return Line(
            self.source_node.body_shape.center, self.target_node.body_shape.center
        )

    def dump(self) -> dict:
        return {
            "source_node": self.source_node.uuid,
            "target_node": self.target_node.uuid,
            "inner_text": self.inner_text,
        }

    def get_components(self) -> list[Paintable]:
        return super().get_components()

    def paint(self, context: PaintContext):
        context.painter.q_painter().setTransform(
            context.camera.get_world2view_transform()
        )
        # 先准备好线上文字的外框矩形
        width, height, _ = get_size_by_text(self.TEXT_FONT_SIZE, self.inner_text)
        link_middle_point = Line(
            self.source_node.body_shape.center,
            self.target_node.body_shape.center,
        ).midpoint()
        # 构造一个中心矩形
        mid_rect = Rectangle(
            link_middle_point
            - NumberVector(
                width / 2 + self.TEXT_PADDING_X,
                height / 2 + self.TEXT_PADDING_Y,
            ),
            width + self.TEXT_PADDING_X * 2,
            height + self.TEXT_PADDING_Y * 2,
        )

        # 画连线
        if SETTING_SERVICE.line_style == 0:
            from_node = self.source_node
            to_node = self.target_node

            context.painter.paint_curve(
                ConnectCurve(
                    from_node.body_shape,
                    to_node.body_shape,
                ),
                QColor(204, 204, 204),
            )
        elif SETTING_SERVICE.line_style == 1:
            from_node = self.source_node
            to_node = self.target_node
            if self.inner_text == "":
                context.painter.paint_straight_line(
                    ConnectStraightLine(
                        from_node.body_shape,
                        to_node.body_shape,
                    ),
                    QColor(204, 204, 204),
                )
            else:
                #  ————   ————>  中间断开
                context.painter.paint_straight_line(
                    ConnectStraightLine(
                        from_node.body_shape,
                        mid_rect,
                    ),
                    QColor(204, 204, 204),
                    with_arrow=False,
                )
                context.painter.paint_straight_line(
                    ConnectStraightLine(
                        mid_rect,
                        to_node.body_shape,
                    ),
                    QColor(204, 204, 204),
                )

        # 画连线上的文字
        link_text = self.inner_text
        link_middle_point = Line(
            self.source_node.body_shape.center,
            self.target_node.body_shape.center,
        ).midpoint()

        if link_text != "":
            text_rect_bg_color = QColor(31, 31, 31, 128)
            if SETTING_SERVICE.line_style == 1:
                text_rect_bg_color = QColor(31, 31, 31, 0)

            # 绘制边框背景色
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                mid_rect.location_left_top,
                width + self.TEXT_PADDING_X * 2,
                height + self.TEXT_PADDING_Y * 2,
                text_rect_bg_color,
            )
            # 绘制文字
            PainterUtils.paint_text_from_center(
                context.painter.q_painter(),
                link_middle_point,
                link_text,
                18,
                QColor(204, 204, 204),
            )
            pass

        context.painter.q_painter().resetTransform()
        pass
