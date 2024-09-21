from PyQt5.QtGui import QColor

from project_graph.data_struct.circle import Circle
from project_graph.data_struct.connect_straight_line import ConnectStraightLine
from project_graph.data_struct.curve import ConnectCurve, ConnectCurveShifted
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity import Entity
from project_graph.entity.entity_node import EntityNode
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.settings.style_service import STYLE_SERVICE
from project_graph.tools.string_tools import get_size_by_text


class NodeLink(Entity):
    """
    连接两个节点的连线
    在集合中的哈希值取决于两个节点的 uuid 组合
    """

    TEXT_PADDING_X = 20  # 左右各留 20px 的空白
    TEXT_PADDING_Y = 2  # 上下各留 2px 的空白
    TEXT_FONT_SIZE = 18  # 连线上标注的文字字体大小

    def __init__(self, source_node: EntityNode, target_node: EntityNode):
        self.source_node = source_node
        self.target_node = target_node

        self.inner_text = ""
        """连线上标注的文本"""

        self.is_shifting = False
        """是否存在双向线的重叠，如果为True则会偏移渲染和偏移碰撞箱"""

    def __hash__(self) -> int:
        combine_uuid = self.source_node.uuid + self.target_node.uuid
        return hash(combine_uuid)

    def __eq__(self, other: "NodeLink") -> bool:
        return (
            self.source_node == other.source_node
            and self.target_node == other.target_node
        )

    def __repr__(self) -> str:
        return f"{self.source_node}➤{self.target_node}"

    def clone(self) -> "NodeLink":
        res = NodeLink(self.source_node, self.target_node)
        res.inner_text = self.inner_text
        return res

    @property
    def body_shape(self) -> Line:
        """临时生成，返回一个身体形状线段，碰撞箱"""
        if self.is_shifting:
            # 偏移，源节点到目标节点的中心连线方向 顺时针旋转 30 度，长度50px
            diff_vector = (
                self.target_node.body_shape.center - self.source_node.body_shape.center
            ).normalize().rotate(90) * 50

            return Line(
                self.source_node.body_shape.center + diff_vector,
                self.target_node.body_shape.center + diff_vector,
            )
        else:
            return Line(
                self.source_node.body_shape.center, self.target_node.body_shape.center
            )

    def reverse(self) -> "NodeLink":
        """
        反转连线，并返回一个新的对象
        """
        res = self.clone()
        res.inner_text = self.inner_text
        res.source_node, res.target_node = res.target_node, res.source_node
        return res

    def dump(self) -> dict:
        return {
            "source_node": self.source_node.uuid,
            "target_node": self.target_node.uuid,
            "inner_text": self.inner_text,
            "is_shifting": self.is_shifting,
        }

    def get_components(self) -> list[Paintable]:
        return super().get_components()

    def get_body_shape(self) -> Line | Circle:
        if self.source_node == self.target_node:
            return Circle(
                self.source_node.body_shape.location_left_top - NumberVector(15, 0), 40
            )
        else:
            return self.body_shape

    def is_intersecting_line(self, line: Line) -> bool:
        """
        判断是否与给定的线段相交
        """
        body_shape = self.get_body_shape()
        if isinstance(body_shape, Circle):
            return body_shape.intersect_with_line(line)
        elif isinstance(body_shape, Line):
            return body_shape.is_intersecting(line)
        else:
            raise TypeError(f"Unsupported body shape type: {type(body_shape)}")

    def _get_rect_by_point(self, point: NumberVector) -> Rectangle:
        text_width, text_height, _ = get_size_by_text(
            self.TEXT_FONT_SIZE, self.inner_text
        )
        # 构造一个中心矩形
        mid_text_rect = Rectangle(
            point
            - NumberVector(
                text_width / 2 + self.TEXT_PADDING_X,
                text_height / 2 + self.TEXT_PADDING_Y,
            ),
            text_width + self.TEXT_PADDING_X * 2,
            text_height + self.TEXT_PADDING_Y * 2,
        )
        return mid_text_rect

    def paint(self, context: PaintContext):
        # 隐藏的节点不绘制连线
        if (
            self.source_node.is_hidden_by_collapse
            or self.target_node.is_hidden_by_collapse
        ):
            return

        context.painter.q_painter().setTransform(
            context.camera.get_world2view_transform()
        )
        # 先准备好线上文字的外框矩形
        text_width, text_height, _ = get_size_by_text(
            self.TEXT_FONT_SIZE, self.inner_text
        )
        # 构造一个中心矩形
        link_middle_point = Line(
            self.source_node.body_shape.center,
            self.target_node.body_shape.center,
        ).midpoint()
        mid_text_rect = self._get_rect_by_point(
            Line(
                self.source_node.body_shape.center,
                self.target_node.body_shape.center,
            ).midpoint()
        )

        link_middle_point_shifted = link_middle_point
        mid_text_rect_shifted = mid_text_rect

        if self.is_shifting:
            shift_vector = (
                self.target_node.body_shape.center - self.source_node.body_shape.center
            ).normalize().rotate(90) * 100
            mid_point = (
                Line(
                    self.source_node.body_shape.center,
                    self.target_node.body_shape.center,
                ).midpoint()
                + shift_vector
            )
            link_middle_point_shifted = mid_point
            mid_text_rect_shifted = self._get_rect_by_point(link_middle_point_shifted)

        # 画连线
        if self.source_node == self.target_node:
            # 自环情况
            from_node = self.source_node
            to_node = self.target_node
            context.painter.paint_curve(
                ConnectCurve(
                    from_node.body_shape,
                    to_node.body_shape,
                ),
                STYLE_SERVICE.style.link_color,
            )
            pass
        else:
            # 非自环情况
            if SETTING_SERVICE.line_style == 0:
                from_node = self.source_node
                to_node = self.target_node
                if self.is_shifting:
                    context.painter.paint_curve(
                        ConnectCurveShifted(
                            from_node.body_shape,
                            to_node.body_shape,
                        ),
                        STYLE_SERVICE.style.link_color,
                    )
                else:
                    context.painter.paint_curve(
                        ConnectCurve(
                            from_node.body_shape,
                            to_node.body_shape,
                        ),
                        STYLE_SERVICE.style.link_color,
                    )
            elif SETTING_SERVICE.line_style == 1:
                from_node = self.source_node
                to_node = self.target_node
                if self.inner_text == "":
                    if self.is_shifting:
                        # 画折现
                        shift_vector = (
                            to_node.body_shape.center - from_node.body_shape.center
                        ).normalize().rotate(90) * 100
                        mid_point = (
                            Line(
                                from_node.body_shape.center, to_node.body_shape.center
                            ).midpoint()
                            + shift_vector
                        )
                        # 构造虚拟的中转矩形 50 * 50
                        size = 1
                        mid_text_rect = Rectangle(
                            mid_point - NumberVector(size / 2, size / 2), size, size
                        )
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                from_node.body_shape,
                                mid_text_rect,
                            ),
                            STYLE_SERVICE.style.link_color,
                            with_arrow=False,
                        )
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                mid_text_rect,
                                to_node.body_shape,
                            ),
                            STYLE_SERVICE.style.link_color,
                        )
                        pass
                    else:
                        # 直接连过去
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                from_node.body_shape,
                                to_node.body_shape,
                            ),
                            STYLE_SERVICE.style.link_color,
                        )
                else:
                    if self.is_shifting:
                        # 画折现
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                from_node.body_shape,
                                mid_text_rect_shifted,
                            ),
                            STYLE_SERVICE.style.link_color,
                            with_arrow=False,
                        )
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                mid_text_rect_shifted,
                                to_node.body_shape,
                            ),
                            STYLE_SERVICE.style.link_color,
                        )
                    else:
                        #  ————   ————>  中间断开
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                from_node.body_shape,
                                mid_text_rect,
                                self.is_shifting,
                            ),
                            STYLE_SERVICE.style.link_color,
                            with_arrow=False,
                        )
                        context.painter.paint_straight_line(
                            ConnectStraightLine(
                                mid_text_rect,
                                to_node.body_shape,
                                self.is_shifting,
                            ),
                            STYLE_SERVICE.style.link_color,
                        )

        # 画连线上的文字
        link_text = self.inner_text
        link_middle_point = Line(
            self.source_node.body_shape.center,
            self.target_node.body_shape.center,
        ).midpoint()

        if link_text != "":
            text_rect_bg_color = STYLE_SERVICE.style.link_text_bg_color
            if SETTING_SERVICE.line_style == 1:
                text_rect_bg_color = QColor(31, 31, 31, 0)
            if self.source_node == self.target_node:
                circle = self.get_body_shape()
                assert isinstance(circle, Circle)
                # 绘制文字
                PainterUtils.paint_text_from_center(
                    context.painter.q_painter(),
                    circle.center - NumberVector(0, circle.radius + 25),
                    link_text,
                    18,
                    STYLE_SERVICE.style.link_text_color,
                )
            else:
                # 绘制边框背景色
                PainterUtils.paint_rect(
                    context.painter.q_painter(),
                    mid_text_rect_shifted.location_left_top
                    if self.is_shifting
                    else mid_text_rect.location_left_top,
                    text_width + self.TEXT_PADDING_X * 2,
                    text_height + self.TEXT_PADDING_Y * 2,
                    text_rect_bg_color,
                )
                # 绘制文字
                PainterUtils.paint_text_from_center(
                    context.painter.q_painter(),
                    link_middle_point_shifted
                    if self.is_shifting
                    else link_middle_point,
                    link_text,
                    18,
                    STYLE_SERVICE.style.link_text_color,
                )
            pass

        context.painter.q_painter().resetTransform()
        pass
