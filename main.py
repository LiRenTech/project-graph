import json
import platform
import subprocess
from pathlib import Path

from PyQt5.QtCore import Qt, QTimer, QUrl
from PyQt5.QtGui import (
    QColor,
    QDesktopServices,
    QIcon,
    QKeyEvent,
    QMouseEvent,
    QPainter,
    QPaintEvent,
    QWheelEvent,
)
from PyQt5.QtWidgets import (
    QAction,
    QApplication,
    QDesktopWidget,
    QFileDialog,
    QInputDialog,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QColorDialog,
)

from core.tools.file_tools import read_file

try:
    from assets import assets
except:
    from PyQt5 import pyrcc_main

    pyrcc_main.processResourceFile(["assets/assets.rcc"], "assets/assets.py", True)
    from assets import assets

import os

from appdirs import user_data_dir

from core.camera import Camera
from core.data_struct.line import Line
from core.data_struct.number_vector import NumberVector
from core.data_struct.rectangle import Rectangle
from core.effect.effect_concrete import (
    EffectCuttingFlash,
    EffectRectangleFlash,
    EffectRectangleShrink,
)
from core.effect.effect_manager import EffectManager
from core.entity.entity import Entity
from core.entity.entity_node import EntityNode
from core.node_manager import NodeManager
from core.paint.paint_elements import paint_details_data, paint_grid
from core.paint.paint_utils import PainterUtils
from core.paint.paintables import PaintContext
from core.paint.painters import ProjectGraphPainter

# 是为了引入assets文件夹中的资源文件，看似是灰色的没有用，但实际不能删掉
# 只是为了让pyinstaller打包时能打包到exe文件中。
# 需要进入assets文件夹后在命令行输入指令 `pyrcc5 image.rcc -o assets.py` 来更新assets.py文件


APP_NAME = "project-graph"
APP_AUTHOR = "LiRen"

DATA_DIR = user_data_dir(APP_NAME, APP_AUTHOR)
print(DATA_DIR)


class Canvas(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()

        # 允许拖拽文件到窗口
        self.setAcceptDrops(True)

        # 创建一个定时器用于定期更新窗口
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.tick)
        self.timer.setInterval(16)  # 1000/60 大约= 16ms
        # 启动定时器
        self.timer.start()

        # ====== 重要对象绑定
        self.camera = Camera(NumberVector.zero(), 1920, 1080)
        self.effect_manager = EffectManager()
        self.node_manager = NodeManager()

        # ====== 拖拽相关
        self.drag_list: list[EntityNode] = []
        """所有拖拽的对象的列表（目前只支持一个，未支持框选多个拖拽）"""
        self.is_dragging = False
        """当前是否正在拖拽"""

        # ====== 连线/断开 相关的操作
        self.connect_from_node: EntityNode | None = None
        self.connect_to_node: EntityNode | None = None
        self.mouse_right_location: NumberVector = NumberVector.zero()
        """鼠标右键的当前位置"""
        self.mouse_right_start_location: NumberVector = NumberVector.zero()
        """右键开始拖拽前按下的位置"""

        self.is_cutting = False
        """当前是否正在切断线"""
        self.warning_lines: list[tuple[Line, EntityNode, EntityNode]] = []
        """准备要被切断的线"""
        self.warning_nodes: list[EntityNode] = []
        """准备要删除的节点"""

        # ====== 拖拽文件进入窗口相关
        self.is_dragging_file = False
        """是否文件正在拖拽悬浮在窗口上"""
        self.is_dragging_file_valid = False
        """是否文件拖拽的有效文件"""

        self.dragging_file_location = NumberVector.zero()
        """拖拽文件悬浮在窗口上的世界位置"""

        pass

    def init_ui(self):
        # 设置窗口标题和尺寸
        self.setWindowTitle("节点图编辑器")
        self._move_window_to_center()
        # 菜单栏
        menubar = self.menuBar()
        assert menubar is not None
        # 文件菜单
        file_menu = menubar.addMenu("文件")
        assert file_menu is not None
        # 打开文件
        open_action = QAction("打开", self)
        open_action.triggered.connect(self.on_open_file)
        # 保存文件
        save_action = QAction("保存", self)
        save_action.triggered.connect(self.on_save_file)
        # 设置快捷键
        open_action.setShortcut("Ctrl+O")
        save_action.setShortcut("Ctrl+S")

        file_menu.addAction(open_action)
        file_menu.addAction(save_action)

        # 帮助说明菜单
        help_menu = menubar.addMenu("帮助")
        assert help_menu is not None
        # 帮助说明
        help_action = QAction("帮助说明", self)
        help_action.triggered.connect(self.on_help)
        # 关于
        about_action = QAction("关于", self)
        about_action.triggered.connect(self.on_about)
        help_menu.addAction(help_action)
        help_menu.addAction(about_action)

    def on_open_file(self):
        # 选择json文件
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择要打开的文件", DATA_DIR, "JSON Files (*.json)"
        )
        if file_path == "":
            return
        # 读取json文件
        with open(file_path, "r", encoding="utf-8") as f:
            load_data = json.loads(f.read())
            self.node_manager.load_from_dict(load_data)

    def on_save_file(self):
        file_path, _ = QFileDialog.getSaveFileName(
            self, "保存文件", "", "JSON Files (*.json);;All Files (*)"
        )
        if file_path:
            # 如果用户选择了文件并点击了保存按钮
            # 保存布局文件
            save_data: dict = self.node_manager.dump_all_nodes()

            # 确保文件扩展名为 .json
            if not file_path.endswith(".json"):
                file_path += ".json"

            with open(file_path, "w") as f:
                json.dump(save_data, f)
        else:
            # 如果用户取消了保存操作
            print("Save operation cancelled.")

    def dragEnterEvent(self, event):
        """从外部拖拽文件进入窗口"""
        self.is_dragging_file = True
        self.is_dragging_file_valid = False

        file = event.mimeData().urls()[0].toLocalFile()
        if file.endswith(".json"):
            self.is_dragging_file_valid = True
        event.acceptProposedAction()

    def dragMoveEvent(self, event):
        view_location = NumberVector(event.pos().x(), event.pos().y())
        world_location = self.camera.location_view2world(view_location)
        self.dragging_file_location = world_location.clone()

    def dragLeaveEvent(self, event):
        self.is_dragging_file = False
        self.is_dragging_file_valid = False

    def dropEvent(self, event):
        """从外部拖拽文件进入窗口并松开"""
        print("dropEvent", event)
        self.is_dragging_file = False
        self.is_dragging_file_valid = False

        for url in event.mimeData().urls():
            print(url)
            file_path: str = url.toLocalFile()
            print(file_path)
            if file_path.endswith(".json"):
                load_data = json.loads(read_file(Path(file_path)))
                print(load_data)
                if "nodes" not in load_data:
                    # 不是合法的节点图文件
                    QMessageBox.warning(
                        self, "错误", "文件内容不正确，无法打开。", QMessageBox.Ok
                    )
                    return
                self.node_manager.add_from_dict(load_data, self.dragging_file_location)
                event.acceptProposedAction()
                break

    @staticmethod
    def on_about():
        # 创建一个消息框
        msg_box = QMessageBox()
        msg_box.setWindowIcon(QIcon("assets/favicon.ico"))
        msg_box.setIcon(QMessageBox.Information)
        msg_box.setWindowTitle("project-graph 关于")
        msg_box.setText(
            "\n\n".join(
                [
                    "这是一个快速绘制节点图的工具，可以用于项目拓扑图绘制、快速头脑风暴草稿。",
                    "Xmind只能用来绘制树形结构图、FigJamBoard可以用来绘制但网页打开有点慢了",
                    "所以做了这个小软件",
                ]
            )
        )
        msg_box.exec_()
        pass

    @staticmethod
    def on_help():
        # 创建一个消息框
        msg_box = QMessageBox()
        msg_box.setWindowIcon(QIcon("assets/favicon.ico"))
        msg_box.setIcon(QMessageBox.Information)
        msg_box.setWindowTitle("project-graph 帮助说明")
        msg_box.setText(
            "\n\n".join(
                [
                    "1. 创建节点：双击空白部分",
                    "2. 编辑节点：双击节点，出现输入框",
                    "3. 移动节点：左键拖拽一个节点",
                    "4. 连接节点：按住右键从一个节点滑动到另一个节点",
                    "5. 切断连线：在空白地方按住右键划出一道切割线",
                    "6. 删除节点：同样使用切割线切节点来删除",
                    "7. 移动视野：W A S D 键",
                    "8. 缩放视野：鼠标滚轮",
                ]
            )
        )
        # github按钮
        button_github = QPushButton("Github 项目地址")
        msg_box.addButton(button_github, QMessageBox.ActionRole)
        button_github.clicked.connect(Canvas.__open_github)
        msg_box.setStandardButtons(QMessageBox.Ok)
        # b站按钮
        button_bilibili = QPushButton("bilibili 视频介绍")
        msg_box.addButton(button_bilibili, QMessageBox.ActionRole)
        button_bilibili.clicked.connect(Canvas.__open_bilibili)

        # 显示消息框
        msg_box.exec_()

    @staticmethod
    def __open_github():
        QDesktopServices.openUrl(QUrl("https://github.com/LiRenTech/project-graph-qt"))

    @staticmethod
    def __open_bilibili():
        QDesktopServices.openUrl(QUrl("https://www.bilibili.com/video/BV1qw4m1k7LD"))

    def _move_window_to_center(self):
        # 获取屏幕可用空间（macOS上会有titlebar占据一部分空间）
        screen_geometry = QDesktopWidget().availableGeometry()

        # 计算新的宽度和高度（长宽各取屏幕的百分之八十）
        new_width = screen_geometry.width() * 0.8
        new_height = screen_geometry.height() * 0.8

        # 计算窗口应该移动到的新位置
        new_left = (screen_geometry.width() - new_width) / 2
        new_top = (screen_geometry.height() - new_height) / 2 + screen_geometry.top()

        # 移动窗口到新位置
        self.setGeometry(int(new_left), int(new_top), int(new_width), int(new_height))

    def tick(self):
        self.effect_manager.tick()
        self.camera.tick()
        self.update()

    def mousePressEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)
        self.is_dragging = True
        if a0.button() == Qt.MouseButton.LeftButton:
            # 更新被选中的节点
            for node in self.node_manager.nodes:
                node.is_selected = False
            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    node.is_selected = True
                    break
            # 拖拽移动
            self.drag_list.clear()

            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    self.drag_list.append(node)

            for node in self.drag_list:
                if node.is_selected:
                    node.dragging_offset = (
                        point_world_location - node.body_shape.location_left_top
                    )
        elif a0.button() == Qt.MouseButton.RightButton:
            self.mouse_right_location = point_world_location
            self.mouse_right_start_location = point_world_location.clone()
            # 开始连线
            self.is_cutting = True
            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    self.connect_from_node = node
                    print("开始连线")
                    self.is_cutting = False
                    # 加特效
                    self.effect_manager.add_effect(
                        EffectRectangleFlash(15, node.body_shape.clone())
                    )
                    break
            pass

    def mouseMoveEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)

        if self.is_dragging:

            if a0.buttons() == Qt.MouseButton.LeftButton:
                # 如果是左键，移动节点
                for node in self.drag_list:
                    new_left_top = point_world_location - node.dragging_offset
                    d_location = new_left_top - node.body_shape.location_left_top
                    # node.move(d_location)
                    self.node_manager.move_node(node, d_location)
            elif a0.buttons() == Qt.MouseButton.RightButton:
                self.mouse_right_location = point_world_location
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
                            pass
                    # 查看切割线是否和其他节点相交
                    for node in self.node_manager.nodes:
                        if node == self.connect_from_node:
                            continue
                        if node.body_shape.is_intersect_with_line(cutting_line):
                            # 准备要切断这个节点，先进行标注
                            self.warning_nodes.append(node)
                else:
                    # 如果是右键，开始连线
                    for node in self.node_manager.nodes:
                        if node.body_shape.is_contain_point(point_world_location):
                            self.connect_to_node = node
                            break

    def mouseReleaseEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        point_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        point_world_location = self.camera.location_view2world(point_view_location)
        self.is_dragging = False

        if a0.button() == Qt.MouseButton.LeftButton:
            pass
        if a0.button() == Qt.MouseButton.RightButton:

            # 结束连线
            if self.connect_from_node is not None and self.connect_to_node is not None:
                connect_result = self.node_manager.connect_node(
                    self.connect_from_node,
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
                        EffectRectangleFlash(
                            15, self.connect_from_node.body_shape.clone()
                        )
                    )
            self.connect_from_node = None
            self.connect_to_node = None

            if self.is_cutting:
                # 切断所有准备切断的线
                for line, start_node, end_node in self.warning_lines:
                    self.node_manager.disconnect_node(start_node, end_node)
                self.warning_lines.clear()
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
                        Line(
                            self.mouse_right_start_location, self.mouse_right_location
                        ),
                    )
                )
        pass

    # 双击
    def mouseDoubleClickEvent(self, event):
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
            else:
                # 在节点上左键是编辑文字
                text, ok = QInputDialog.getText(
                    self, "编辑节点文字", "输入新的文字:", text=select_node.inner_text
                )
                if ok:
                    select_node.inner_text = text
                    
        elif event.button() == Qt.MouseButton.RightButton:
            if select_node is not None:
                color = QColorDialog.getColor()  # 弹出颜色选择对话框
                if color.isValid():  # 检查颜色是否有效
                    select_node.color = color  # 假设节点有一个 color 属性来存储颜色
            pass

    def wheelEvent(self, a0: QWheelEvent | None):
        assert a0 is not None
        # 检查滚轮方向
        if a0.angleDelta().y() > 0:
            self.camera.zoom_in()
        else:
            self.camera.zoom_out()

        # 你可以在这里添加更多的逻辑来响应滚轮事件
        a0.accept()

    def keyPressEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        key = a0.key()
        print(f"<{key}>", type(key))

        if key == Qt.Key.Key_A:
            self.camera.press_move(NumberVector(-1, 0))
        elif key == Qt.Key.Key_S:
            self.camera.press_move(NumberVector(0, 1))
        elif key == Qt.Key.Key_D:
            self.camera.press_move(NumberVector(1, 0))
        elif key == Qt.Key.Key_W:
            self.camera.press_move(NumberVector(0, -1))
        elif key == Qt.Key.Key_BracketLeft:
            # `[` 键来缩小视野
            for _ in range(5):
                self.camera.zoom_out()
        elif key == Qt.Key.Key_BracketRight:
            # `]` 键来放大视野
            for _ in range(5):
                self.camera.zoom_in()
        elif key == 16777220:
            # Qt.Key.Key_Enter 这里写这个无效
            # 回车键，如果当前有正在选中的节点，则进入编辑模式
            if self.node_manager.cursor_node is not None:
                # 在节点上左键是编辑文字
                text, ok = QInputDialog.getText(
                    self, "编辑节点文字", "输入新的文字:", text=self.node_manager.cursor_node.inner_text
                )
                if ok:
                    self.node_manager.cursor_node.inner_text = text
                    self.node_manager.update_lines()

        elif key == Qt.Key.Key_Left:
            self.node_manager.move_cursor('left')
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Right:
            self.node_manager.move_cursor('right')
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Up:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.rotate_grow_direction(False)
                return
            self.node_manager.move_cursor('up')
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Down:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.rotate_grow_direction(True)
                return
            self.node_manager.move_cursor('down')
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Tab:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.grow_node_confirm()
            else:
                self.node_manager.grow_node()
        elif key == Qt.Key.Key_Escape:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.grow_node_cancel()

    def keyReleaseEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        key = a0.key()
        if key == Qt.Key.Key_A:
            self.camera.release_move(NumberVector(-1, 0))
        elif key == Qt.Key.Key_S:
            self.camera.release_move(NumberVector(0, 1))
        elif key == Qt.Key.Key_D:
            self.camera.release_move(NumberVector(1, 0))
        elif key == Qt.Key.Key_W:
            self.camera.release_move(NumberVector(0, -1))

    def paintEvent(self, a0: QPaintEvent | None):
        assert a0 is not None
        painter = QPainter(self)
        # 获取窗口的尺寸
        rect = self.rect()
        # 更新camera大小，防止放大窗口后缩放中心点还在左上部分
        self.camera.reset_view_size(rect.width(), rect.height())
        # 使用黑色填充整个窗口
        painter.fillRect(rect, QColor(43, 43, 43, 255))
        # 画网格
        paint_grid(painter, self.camera)
        # 当前的切断线
        if self.is_cutting:
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(self.mouse_right_start_location),
                self.camera.location_world2view(self.mouse_right_location),
                QColor(255, 0, 0),
                2 * self.camera.current_scale,
            )

        # 当前鼠标画连接线
        if self.connect_from_node is not None and self.mouse_right_location is not None:
            # 如果鼠标位置是没有和任何节点相交的
            connect_node = None
            for node in self.node_manager.nodes:
                if node == self.connect_from_node:
                    continue
                if node.body_shape.is_contain_point(self.mouse_right_location):
                    connect_node = node
                    break
            if connect_node:
                # 像吸附住了一样画线
                PainterUtils.paint_arrow(
                    painter,
                    self.camera.location_world2view(
                        self.connect_from_node.body_shape.center
                    ),
                    self.camera.location_world2view(connect_node.body_shape.center),
                    QColor(255, 255, 255),
                    2 * self.camera.current_scale,
                    30 * self.camera.current_scale,
                )
            else:
                # 实时连线
                PainterUtils.paint_arrow(
                    painter,
                    self.camera.location_world2view(
                        self.connect_from_node.body_shape.center
                    ),
                    self.camera.location_world2view(self.mouse_right_location),
                    QColor(255, 255, 255),
                    2 * self.camera.current_scale,
                    30 * self.camera.current_scale,
                )

        # 上下文对象
        paint_context = PaintContext(ProjectGraphPainter(painter), self.camera)

        self.node_manager.paint(paint_context)
        # 所有要被切断的线
        for line, _, _ in self.warning_lines:
            PainterUtils.paint_solid_line(
                painter,
                self.camera.location_world2view(line.start),
                self.camera.location_world2view(line.end),
                QColor(255, 0, 0, 128),
                int(10 * self.camera.current_scale),
            )
        # 所有要被删除的节点
        for node in self.warning_nodes:
            PainterUtils.paint_rect_from_left_top(
                painter,
                self.camera.location_world2view(node.body_shape.location_left_top),
                node.body_shape.width * self.camera.current_scale,
                node.body_shape.height * self.camera.current_scale,
                QColor(255, 0, 0, 128),
                QColor(255, 0, 0, 128),
                int(10 * self.camera.current_scale),
            )
        # 特效
        self.effect_manager.paint(paint_context)
        # 绘制细节信息
        paint_details_data(
            painter,
            self.camera,
            [
                f"当前缩放: {self.camera.current_scale:.2f}",
                f"location: {self.camera.location}",
                f"effect: {len(self.effect_manager.effects)}",
            ],
        )
        # 最终覆盖在屏幕上一层：拖拽情况
        if self.is_dragging_file:
            PainterUtils.paint_rect_from_left_top(
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
                QColor(148, 220, 254),
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
                QColor(148, 220, 254),
                1,
            )
            if self.is_dragging_file_valid:
                PainterUtils.paint_word_from_center(
                    painter,
                    NumberVector(a0.rect().width() / 2, a0.rect().height() / 2),
                    "拖拽文件到窗口中",
                    30,
                    QColor(255, 255, 255),
                )
            else:
                PainterUtils.paint_word_from_center(
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
        pass


def main():
    import sys
    import traceback

    # 确保数据目录存在
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        with open(os.path.join(DATA_DIR, "settings.json"), "w", encoding="utf-8") as f:
            f.write("{}")

    try:
        sys.excepthook = sys.__excepthook__

        app = QApplication(sys.argv)
        app.setWindowIcon(QIcon("./assets/favicon.ico"))

        canvas = Canvas()
        canvas.show()

        sys.exit(app.exec_())
    except Exception as e:
        # 捕捉不到
        traceback.print_exc()
        print(e)
        sys.exit(1)
    pass


if __name__ == "__main__":
    main()
