"""
和鼠标事件相关的函数
"""

import typing

from PyQt5.QtCore import Qt
from PyQt5.QtGui import QMouseEvent, QWheelEvent
from PyQt5.QtWidgets import QColorDialog, QInputDialog

from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.effect.effect_concrete import (
    EffectCircleExpand,
    EffectCuttingFlash,
    EffectRectangleFlash,
    EffectRectangleShrink,
)
from project_graph.logging import log
from project_graph.status_text.status_text import STATUS_TEXT

if typing.TYPE_CHECKING:
    from .main_window import Canvas


def mousePressEvent(self: "Canvas", a0: QMouseEvent | None):
    assert a0 is not None
    point_view_location = NumberVector(a0.pos().x(), a0.pos().y())

    is_press_toolbar = self.toolbar.on_click(self.camera, point_view_location)
    if is_press_toolbar:
        log("按到了toolbar")
        return

    self.node_manager.cursor_node = None

    point_world_location = self.camera.location_view2world(point_view_location)
    self.toolbar.nodes = []
    self.is_pressing = True
    if a0.button() == Qt.MouseButton.LeftButton:
        # 可能的4种情况
        # ------------ | 已有节点被选择 | 没有节点被选择
        # 在空白地方按下 |      A       |      B
        # 在节点身上按下 |      C       |      D

        # A：取消选择那些节点，可能要重新开始框选
        # B：可能是想开始框选
        # C：如果点击的节点属于被上次选中的节点中，那么整体移动
        #    如果点击的节点不属于被上次选中的节点中，那么单击选择
        # D：只想单击这一个节点

        # 更新被选中的节点，如果没有选中节点就开始框选

        is_have_selected_node = any(
            node.is_selected for node in self.node_manager.nodes
        )
        is_click_on_node = any(
            node.body_shape.is_contain_point(point_world_location)
            for node in self.node_manager.nodes
        )

        # 获取点击的节点
        click_node = None
        for node in self.node_manager.nodes:
            if node.body_shape.is_contain_point(point_world_location):
                click_node = node
                break

        self.status_bar.showMessage(STATUS_TEXT["normal"])

        if is_click_on_node:
            assert click_node is not None
            if is_have_selected_node:
                # C
                if click_node.is_selected:
                    # 如果点击的节点属于被上次选中的节点中，那么整体移动
                    self.status_bar.showMessage(STATUS_TEXT["select"])
                else:
                    # 取消选择所有节点
                    for node in self.node_manager.nodes:
                        node.is_selected = False
                    # 单击选择
                    click_node.is_selected = True
                    self.status_bar.showMessage(STATUS_TEXT["select"])
            else:
                # D
                click_node.is_selected = True
                self.status_bar.showMessage(STATUS_TEXT["select"])
        else:
            # A B
            self.is_selecting = True
            self.select_start_location = point_world_location.clone()
            # 取消选择所有节点
            for node in self.node_manager.nodes:
                node.is_selected = False
            pass

        # 为移动做准备
        self.last_move_location = point_world_location.clone()

    elif a0.button() == Qt.MouseButton.RightButton:
        # 如果是在节点上开始右键的，那么就开始连线
        # 如果是在空白上开始右键的，那么就开始切割线

        self.mouse_right_location = point_world_location
        self.mouse_right_start_location = point_world_location.clone()
        # 开始连线
        self.is_cutting = True
        is_click_on_node = any(
            node.body_shape.is_contain_point(point_world_location)
            for node in self.node_manager.nodes
        )

        click_node = None
        for node in self.node_manager.nodes:
            if node.body_shape.is_contain_point(point_world_location):
                click_node = node
                break

        if is_click_on_node:
            assert click_node is not None

            self.is_cutting = False
            self.connect_from_nodes = [
                node for node in self.node_manager.nodes if node.is_selected
            ]
            if click_node not in self.connect_from_nodes:
                # 如果 右键的节点 没有在被选中的节点中，则不触发多重连接
                self.connect_from_nodes = [click_node]
                self.effect_manager.add_effect(
                    EffectRectangleFlash(15, click_node.body_shape.clone())
                )
            else:
                # 如果在被选中的节点中，则触发多重连接
                for node in self.node_manager.nodes:
                    # 加特效
                    if node.is_selected:
                        self.effect_manager.add_effect(
                            EffectRectangleFlash(15, node.body_shape.clone())
                        )
        else:
            self.is_cutting = True
            self.connect_from_nodes = []
            self.selected_links.clear()
    elif a0.button() == Qt.MouseButton.MiddleButton:
        # 准备移动视野
        self.mouse_location_last_middle_button = self.camera.location_view2world(
            NumberVector(a0.pos().x(), a0.pos().y())
        )


def mouseMoveEvent(self: "Canvas", a0: QMouseEvent | None):
    """这个只有在配合鼠标按下的时候才会触发"""
    assert a0 is not None
    mouse_view_location = NumberVector(a0.pos().x(), a0.pos().y())
    mouse_world_location = self.camera.location_view2world(mouse_view_location)

    self.mouse_location = NumberVector(a0.x(), a0.y())

    if self.is_pressing:
        if a0.buttons() == Qt.MouseButton.LeftButton:
            # 如果是左键，移动节点或者框选
            if self.is_selecting:
                """
                框选 + 线选 组合
                框选选节点，线选选连接
                如果什么都没选到，就都能选
                如果一旦框选选中了节点，就只能框选了，线选功能被屏蔽
                (框选优先级 > 线选)
                """
                # 框选
                select_rectangle = Rectangle.from_two_points(
                    self.select_start_location.clone(), mouse_world_location
                )
                is_have_selected_node = False
                # 找到在框选范围内的所有节点
                self.status_bar.showMessage(STATUS_TEXT["normal"])
                for node in self.node_manager.nodes:
                    node.is_selected = node.body_shape.is_collision(select_rectangle)
                    is_have_selected_node = is_have_selected_node or node.is_selected

                # 线选
                self.selected_links.clear()
                if is_have_selected_node:
                    self.status_bar.showMessage(STATUS_TEXT["select"])
                else:
                    select_line = Line(self.select_start_location, mouse_world_location)

                    for link in self.node_manager.get_all_links():
                        link_body_line = Line(
                            link.source_node.body_shape.center,
                            link.target_node.body_shape.center,
                        )
                        if link_body_line.is_intersecting(select_line):
                            # 选择这个link
                            self.selected_links.append(link)
            else:
                # 移动

                # 当前帧距离上一帧的 鼠标移动向量
                mouse_d_location = mouse_world_location - self.last_move_location
                for node in self.node_manager.nodes:
                    if node.is_selected:
                        if Qt.Key.Key_Control in self.pressing_keys:
                            # 按住Ctrl，移动节点，带动子节点一起移动
                            self.node_manager.move_node_with_children(
                                node, mouse_d_location
                            )
                        else:
                            self.node_manager.move_node(node, mouse_d_location)

            self.last_move_location = mouse_world_location.clone()

        elif a0.buttons() == Qt.MouseButton.RightButton:
            self.mouse_right_location = mouse_world_location
            self.warning_lines.clear()
            self.warning_nodes.clear()
            if self.is_cutting:
                cutting_line = Line(
                    self.mouse_right_start_location, self.mouse_right_location
                )
                # 查看切割线是否和其他连线相交
                for (
                    line,
                    start_node,
                    end_node,
                ) in self.node_manager.get_all_lines_and_node():
                    if line.is_intersecting(cutting_line):
                        # 准备要切断这个线，先进行标注
                        self.warning_lines.append((line, start_node, end_node))
                # 查看切割线是否和其他节点相交
                for node in self.node_manager.nodes:
                    if node == self.connect_from_nodes:
                        continue
                    if node.body_shape.is_intersect_with_line(cutting_line):
                        # 准备要切断这个节点，先进行标注
                        self.warning_nodes.append(node)
            else:
                # 如果是右键，开始连线
                for node in self.node_manager.nodes:
                    if node.body_shape.is_contain_point(mouse_world_location):
                        self.connect_to_node = node
                        break
        elif a0.buttons() == Qt.MouseButton.MiddleButton:
            # 移动的时候，应该记录与上一次鼠标位置的相差距离向量
            current_mouse_move_location = self.camera.location_view2world(
                NumberVector(a0.pos().x(), a0.pos().y())
            )
            diff_location = (
                current_mouse_move_location - self.mouse_location_last_middle_button
            )
            self.camera.location -= diff_location
    else:
        # 鼠标放在哪个节点上，就显示哪个节点的详细信息
        for node in self.node_manager.nodes:
            if node.body_shape.is_contain_point(mouse_world_location):
                node.is_detail_show = True
            else:
                node.is_detail_show = False


def mouseReleaseEvent(self: "Canvas", a0: QMouseEvent | None):
    assert a0 is not None
    self.is_pressing = False
    mouse_view_location = NumberVector(a0.pos().x(), a0.pos().y())

    if a0.button() == Qt.MouseButton.LeftButton:
        # 结束框选
        if self.is_selecting:
            self.is_selecting = False
        # 是否需要显示toolbar（如果是在toolbar上弹起的，就不显示）
        if not self.toolbar.is_click_inside(self.camera, mouse_view_location):
            # 显示toolbar
            self.toolbar.nodes = [
                node for node in self.node_manager.nodes if node.is_selected
            ]
            # 没有节点被选中就不显示
            if len(self.toolbar.nodes) > 0:
                bounding_rectangle = Rectangle.get_bounding_rectangle(
                    [node.body_shape for node in self.toolbar.nodes]
                )
                # toolbar 位置为所有选中的节点的外接矩形的右下角
                self.toolbar.body_shape.location_left_top = (
                    bounding_rectangle.right_bottom + NumberVector(50, 50)
                )
        else:
            # 隐藏toolbar，直接让其移动到视野之外解决
            self.toolbar.body_shape.location_left_top = NumberVector(-1000000, -1000000)
            self.toolbar.nodes = []
            pass
    if a0.button() == Qt.MouseButton.RightButton:
        # 结束连线
        if len(self.connect_from_nodes) > 0 and self.connect_to_node is not None:
            for node in self.connect_from_nodes:
                connect_result = self.node_manager.connect_node(
                    node,
                    self.connect_to_node,
                )
                if connect_result:
                    # 加特效
                    self.effect_manager.add_effect(
                        EffectRectangleFlash(
                            15, self.connect_to_node.body_shape.clone()
                        )
                    )
                    self.effect_manager.add_effect(
                        EffectRectangleFlash(15, node.body_shape.clone())
                    )
        self.connect_from_nodes = []
        self.connect_to_node = None

        if self.is_cutting:
            # 切断所有准备切断的线
            for line, start_node, end_node in self.warning_lines:
                self.node_manager.disconnect_node(start_node, end_node)
            self.warning_lines.clear()
            self.selected_links.clear()
            # 删除所有准备删除的节点
            for node in self.warning_nodes:
                self.node_manager.delete_node(node)
                # 加特效
                self.effect_manager.add_effect(
                    EffectRectangleShrink(15, node.body_shape.clone())
                )
            self.warning_nodes.clear()
            self.is_cutting = False
            # 加特效
            self.effect_manager.add_effect(
                EffectCuttingFlash(
                    15,
                    Line(self.mouse_right_start_location, self.mouse_right_location),
                )
            )
    pass


# 双击
def mouseDoubleClickEvent(self: "Canvas", event: QMouseEvent | None):
    assert event is not None
    # 把点击坐标转换为世界坐标
    click_location = self.camera.location_view2world(
        NumberVector(event.pos().x(), event.pos().y())
    )
    select_node = None
    for node in self.node_manager.nodes:
        if node.body_shape.is_contain_point(click_location):
            select_node = node
            break

    if event.button() == Qt.MouseButton.LeftButton:
        if select_node is None:
            # 在空白地方左键是添加节点
            self.node_manager.add_node_by_click(click_location)
            self.effect_manager.add_effect(EffectCircleExpand(15, click_location))
        else:
            if Qt.Key.Key_Control in self.pressing_keys:
                # 按住Ctrl 双击，编辑多行文本
                text, ok = QInputDialog.getMultiLineText(
                    self,
                    "编辑节点详细内容",
                    "输入新的文字:",
                    text=select_node.details,
                )
                if ok:
                    select_node.details = text
            else:
                # 在节点上左键是编辑文字
                text, ok = QInputDialog.getText(
                    self,
                    "编辑节点文字",
                    "输入新的文字:",
                    text=select_node.inner_text,
                )
                if ok:
                    select_node.inner_text = text
                    self.node_manager.update_lines()

    elif event.button() == Qt.MouseButton.RightButton:
        if select_node is not None:
            color = QColorDialog.getColor()  # 弹出颜色选择对话框
            if color.isValid():  # 检查颜色是否有效
                select_node.color = color  # 假设节点有一个 color 属性来存储颜色
        pass


def wheelEvent(self: "Canvas", a0: QWheelEvent | None):
    assert a0 is not None
    delta = a0.angleDelta().y()
    # 如果鼠标当前是在一个节点上的，那么不缩放
    is_mouse_hover_node = False
    hover_node = None
    view_location = NumberVector(a0.pos().x(), a0.pos().y())
    world_location = self.camera.location_view2world(view_location)
    for node in self.node_manager.nodes:
        if node.body_shape.is_contain_point(world_location):
            is_mouse_hover_node = True
            hover_node = node
            break

    if is_mouse_hover_node:
        # 旋转节点
        if hover_node is not None:
            if delta > 0:
                self.node_manager.rotate_node(hover_node, 10)
            else:
                self.node_manager.rotate_node(hover_node, -10)
        pass
    else:
        # 检查滚轮方向
        if delta > 0:
            self.camera.zoom_in()
        else:
            self.camera.zoom_out()

    # 你可以在这里添加更多的逻辑来响应滚轮事件
    a0.accept()
