"""
渲染主窗口的事件
"""

import typing

from PyQt5.QtGui import QColor, QPainter, QPaintEvent

from project_graph.data_struct.circle import Circle
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.node_link import NodeLink
from project_graph.paint.paint_elements import paint_details_data, paint_grid
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import PaintContext
from project_graph.paint.painters import ProjectGraphPainter
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.settings.style_service import STYLE_SERVICE

if typing.TYPE_CHECKING:
    from .main_window import Canvas


def main_window_paint_event(self: "Canvas", a0: QPaintEvent | None):
    assert a0 is not None
    painter = QPainter(self)
    # 获取窗口的尺寸
    rect = self.rect()
    # 更新camera大小，防止放大窗口后缩放中心点还在左上部分
    self.camera.reset_view_size(rect.width(), rect.height())
    # 上下文对象
    paint_context = PaintContext(
        ProjectGraphPainter(painter), self.camera, self.mouse_location
    )
    # 使用黑色填充整个窗口
    painter.fillRect(rect, STYLE_SERVICE.style.background_color)

    # 画网格
    if SETTING_SERVICE.is_show_grid:
        paint_grid(paint_context)
    # 当前的切断线
    if self.is_cutting:
        PainterUtils.paint_solid_line(
            painter,
            self.camera.location_world2view(self.mouse_right_start_location),
            self.camera.location_world2view(self.mouse_right_location),
            STYLE_SERVICE.style.cutting_warning_line_color,
            2 * self.camera.current_scale,
        )

    # 框选 + 线选
    if self.is_selecting:
        """
             |  有线       |  无线  |
        有节点|  不可能      |  画框
        无节点|  画线+浅框   |  都画
        """
        is_have_selected_node = any(
            node.is_selected for node in self.node_manager.nodes
        )
        is_have_selected_link = len(self.selected_links) > 0
        rect = Rectangle.from_two_points(
            self.select_start_location.clone(),
            self.last_move_location.clone(),
        )
        if not is_have_selected_link:
            PainterUtils.paint_rect(
                painter,
                self.camera.location_world2view(rect.location_left_top),
                rect.width * self.camera.current_scale,
                rect.height * self.camera.current_scale,
                STYLE_SERVICE.style.select_rectangle_fill_color,
                STYLE_SERVICE.style.select_rectangle_border_color,
                2,
            )
        # 如果没有框选住节点，就画线
        if not is_have_selected_node:
            # 画一个浅色框
            PainterUtils.paint_rect(
                painter,
                self.camera.location_world2view(rect.location_left_top),
                rect.width * self.camera.current_scale,
                rect.height * self.camera.current_scale,
                QColor(0, 0, 0, 0),
                STYLE_SERVICE.style.select_line_rect_color,
                2,
            )
            # 画框选对角线
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(self.select_start_location.clone()),
                self.camera.location_world2view(self.last_move_location.clone()),
                STYLE_SERVICE.style.select_line_color,
                20,
            )

    # 当前鼠标画连接线
    if self.connect_from_nodes and self.mouse_right_location is not None:
        # 如果鼠标位置是没有和任何节点相交的
        connect_target_node = None
        for node in self.node_manager.nodes:
            if node.body_shape.is_contain_point(self.mouse_right_location):
                connect_target_node = node
                break
        if connect_target_node:
            # 像吸附住了一样画线
            for node in self.connect_from_nodes:
                _link = NodeLink(node, connect_target_node)
                _link.paint(paint_context)
        else:
            # 实时连线
            for node in self.connect_from_nodes:
                PainterUtils.paint_arrow(
                    painter,
                    self.camera.location_world2view(node.body_shape.center),
                    self.camera.location_world2view(self.mouse_right_location),
                    STYLE_SERVICE.style.connecting_line_color,
                    2 * self.camera.current_scale,
                    30 * self.camera.current_scale,
                )

    # 所有节点和连线
    self.node_manager.paint(paint_context)

    # 所有要被切断的线
    for link in self.warning_links:
        link_body_shape = link.get_body_shape()
        if isinstance(link_body_shape, Line):
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(link.source_node.body_shape.center),
                self.camera.location_world2view(link.target_node.body_shape.center),
                STYLE_SERVICE.style.warning_link_cover_color,
                int(10 * self.camera.current_scale),
            )
        elif isinstance(link_body_shape, Circle):
            PainterUtils.paint_circle(
                painter,
                Circle(
                    self.camera.location_world2view(link_body_shape.center),
                    link_body_shape.radius * self.camera.current_scale,
                ),
                QColor(0, 0, 0, 0),
                STYLE_SERVICE.style.warning_link_cover_color,
                10 * self.camera.current_scale,
            )
            pass
    # 所有选择的线
    for link in self.selected_links:
        link_body_line = link.get_body_shape()
        if isinstance(link_body_line, Line):
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(link_body_line.start),
                self.camera.location_world2view(link_body_line.end),
                STYLE_SERVICE.style.selecting_link_cover_color,
                int(20 * self.camera.current_scale),
            )
        elif isinstance(link_body_line, Circle):
            PainterUtils.paint_circle(
                painter,
                Circle(
                    self.camera.location_world2view(link_body_line.center),
                    link_body_line.radius * self.camera.current_scale,
                ),
                QColor(0, 0, 0, 0),
                STYLE_SERVICE.style.selecting_link_cover_color,
                20 * self.camera.current_scale,
            )
        pass
    # 所有要被删除的节点
    for node in self.warning_nodes:
        PainterUtils.paint_rect(
            painter,
            self.camera.location_world2view(node.body_shape.location_left_top),
            node.body_shape.width * self.camera.current_scale,
            node.body_shape.height * self.camera.current_scale,
            STYLE_SERVICE.style.warning_node_cover_fill_color,
            STYLE_SERVICE.style.warning_node_cover_stroke_color,
            int(10 * self.camera.current_scale),
        )
    # 特效
    self.effect_manager.paint(paint_context)
    # 绘制细节信息
    if SETTING_SERVICE.is_show_debug_text:
        paint_details_data(
            painter,
            self.camera,
            [
                f"历史情况：{self.node_manager.progress_recorder.stringify()}",
                f"path: {self.node_manager.file_path}",
                f"当前缩放: {self.camera.current_scale:.2f}",
                f"摄像机位置: ({self.camera.location.x:.2f}, {self.camera.location.y:.2f})",
                f"特效数量: {len(self.effect_manager.effects)}",
                f"节点数量: {len(self.node_manager.nodes)}",
                f"连接数量: {len(self.node_manager.get_all_links())}",
                f"开始连接节点：{self.connect_from_nodes}",
                f"连接目标节点：{self.connect_to_node}",
                f"按下的键: {self.pressing_keys}",
                f"克隆节点：{len(self.node_manager.clone_series["nodes"])}",
                f"待删除节点：{self.warning_nodes}",
                f"待删除连接：{self.warning_links}",
                f"选择的连接：{self.selected_links}",
                f"历史记录当前节点：{self.node_manager.progress_recorder.get_current_index()}",
                f"历史记录节点总量：{self.node_manager.progress_recorder.node_count}",
            ],
        )
    # 工具栏
    self.toolbar.paint(paint_context)
    # 最终覆盖在屏幕上一层：拖拽情况
    if self.is_dragging_file:
        PainterUtils.paint_rect(
            painter,
            NumberVector.zero(),
            a0.rect().width(),
            a0.rect().height(),
            QColor(0, 0, 0, 128),
            QColor(255, 255, 255, 0),
            int(10 * self.camera.current_scale),
        )
        # 绘制横竖线
        PainterUtils.paint_solid_line(
            painter,
            NumberVector(
                0, self.camera.location_world2view(self.dragging_file_location).y
            ),
            NumberVector(
                a0.rect().width(),
                self.camera.location_world2view(self.dragging_file_location).y,
            ),
            STYLE_SERVICE.style.dragging_file_line_color,
            1,
        )
        PainterUtils.paint_solid_line(
            painter,
            NumberVector(
                self.camera.location_world2view(self.dragging_file_location).x, 0
            ),
            NumberVector(
                self.camera.location_world2view(self.dragging_file_location).x,
                a0.rect().height(),
            ),
            STYLE_SERVICE.style.dragging_file_line_color,
            1,
        )
        if self.is_dragging_file_valid:
            PainterUtils.paint_text_from_center(
                painter,
                NumberVector(a0.rect().width() / 2, a0.rect().height() / 2),
                "拖拽文件到窗口中",
                30,
                QColor(255, 255, 255),
            )
        else:
            PainterUtils.paint_text_from_center(
                painter,
                NumberVector(a0.rect().width() / 2, a0.rect().height() / 2),
                "不支持的文件类型，请拖入json文件",
                30,
                QColor(255, 0, 0),
            )
        pass

    # 检查窗口是否处于激活状态
    if not self.isActiveWindow():
        # 绘制一个半透明的覆盖层（目的是放置WASD输入到别的软件上）
        painter.setBrush(QColor(0, 0, 0, 128))  # 半透明的黑色
        painter.drawRect(self.rect())
        # 把按键清空，防止失效
        self.pressing_keys = set()

    pass
