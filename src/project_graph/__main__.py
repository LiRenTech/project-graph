import json
import platform
import subprocess
from pathlib import Path
import sys
import traceback
from types import TracebackType

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
    QColorDialog,
    QDesktopWidget,
    QDialog,
    QFileDialog,
    QInputDialog,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QVBoxLayout,
)

from project_graph.app_dir import DATA_DIR
from project_graph.data_struct.rectangle import Rectangle
from project_graph.logging import log, logs
from project_graph.recent_file_manager import RecentFileManager
from project_graph.toolbar.toolbar import Toolbar
from project_graph.tools.file_tools import read_file

try:
    from project_graph.assets import assets  # type: ignore  # noqa: F401
except ImportError:
    from PyQt5 import pyrcc_main

    if not pyrcc_main.processResourceFile(
        [(Path(__file__).parent / "assets" / "image.rcc").as_posix()],
        (Path(__file__).parent / "assets" / "assets.py").as_posix(),
        False,
    ):
        log("Failed to compile assets.rcc")
        exit(1)

    from project_graph.assets import assets  # type: ignore  # noqa: F401

import os

from project_graph.camera import Camera
from project_graph.data_struct.line import Line
from project_graph.data_struct.number_vector import NumberVector
from project_graph.effect.effect_concrete import (
    EffectCircleExpand,
    EffectCuttingFlash,
    EffectRectangleFlash,
    EffectRectangleShrink,
)
from project_graph.effect.effect_manager import EffectManager
from project_graph.entity.entity_node import EntityNode
from project_graph.node_manager import NodeManager
from project_graph.paint.paint_elements import paint_details_data, paint_grid
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import PaintContext
from project_graph.paint.painters import ProjectGraphPainter


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
        self.recent_file_manager = RecentFileManager()
        self.toolbar: Toolbar = Toolbar()
        """工具栏对象"""

        self.init_toolbar()

        # ====== 鼠标事件相关
        self.is_dragging = False
        """当前鼠标是否按下"""
        self.mouse_location = NumberVector.zero()
        """鼠标当前位置"""

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

        # ====== 框选相关
        self.is_selecting = False
        """是否正在框选"""
        self.select_rectangle: Rectangle | None = None
        """框选的矩形"""
        self.select_start_location: NumberVector = NumberVector.zero()
        """框选的矩形的左上角位置"""
        self.last_move_location = NumberVector.zero()
        """在框选拖动移动时，上一帧鼠标的位置（用于计算上一帧到当前帧的向量）（世界坐标）"""

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
        if platform.system() == "Darwin":
            self.setWindowIcon(QIcon("assets/favicon.ico"))
        elif platform.system() == "Windows" or platform.system() == "Linux":
            self.setWindowIcon(QIcon(":/favicon.ico"))
        self._move_window_to_center()

        # 菜单栏
        menubar = self.menuBar()
        assert menubar is not None
        # 文件菜单
        file_menu = menubar.addMenu("文件")
        assert file_menu is not None
        # 打开文件
        open_action = QAction("打开新图", self)
        open_action.triggered.connect(self.on_open_file)
        # 保存文件
        save_action = QAction("保存当前图", self)
        save_action.triggered.connect(self.on_save_file)
        # 打开曾经保存的
        open_recent_action = QAction("打开曾经保存的", self)
        open_recent_action.triggered.connect(self.open_recent_file)

        # 设置快捷键
        open_action.setShortcut("Ctrl+O")
        save_action.setShortcut("Ctrl+S")
        open_recent_action.setShortcut("Ctrl+R")

        file_menu.addAction(open_action)
        file_menu.addAction(save_action)
        file_menu.addAction(open_recent_action)

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

        # 打开缓存文件夹
        cache_folder_action = QAction("打开缓存文件夹", self)
        cache_folder_action.triggered.connect(self.open_cache_folder)
        help_menu.addAction(cache_folder_action)

        # 测试菜单
        test_menu = menubar.addMenu("测试")
        assert test_menu is not None
        # 抛出异常
        test_exception_action = QAction("抛出异常", self)
        test_exception_action.triggered.connect(self.on_test_exception)
        test_menu.addAction(test_exception_action)

    def init_toolbar(self):
        self.toolbar.tool_list[0].set_bind_event_function(
            self._delete_current_select_node
        )
        pass

    def _delete_current_select_node(self):
        """删除当前选中的节点"""
        log("删除当前选中的节点")
        self.node_manager.delete_nodes(
            [node for node in self.node_manager.nodes if node.is_selected]
        )
        pass

    def open_cache_folder(self):
        """打开缓存文件夹"""
        if platform.system() == "Windows":
            subprocess.Popen(r'explorer /select,"{}"'.format(DATA_DIR))
        elif platform.system() == "Darwin":
            subprocess.Popen(["open", DATA_DIR])
        else:
            subprocess.Popen(["xdg-open", DATA_DIR])

    def open_recent_file(self):
        """打开最近的文件"""
        # 创建一个新的 QDialog 实例
        dialog = QDialog(self)
        dialog.setWindowTitle("最近的文件")

        # 设置布局
        layout = QVBoxLayout()

        # 添加一些示例控件
        label = QLabel("这里是最近的文件列表")
        layout.addWidget(label)

        for recent_file in self.recent_file_manager.recent_files_list:
            file_path = recent_file.file_path
            last_opened_time = recent_file.last_opened_time
            size = recent_file.size
            button = QPushButton(
                f"{file_path}  ({last_opened_time.strftime('%Y-%m-%d %H:%M:%S')}, {size}B)"
            )
            button.clicked.connect(lambda: self.on_open_file_by_path(str(file_path)))
            layout.addWidget(button)

        # 设置布局到对话框
        dialog.setLayout(layout)

        # 显示对话框
        dialog.exec_()

    def on_open_file_by_path(self, file_path: str):
        """
        根据文件路径打开文件
        """
        # 读取json文件
        with open(file_path, "r", encoding="utf-8") as f:
            load_data = json.loads(f.read())
            self.node_manager.load_from_dict(load_data)
            self.recent_file_manager.add_recent_file(Path(file_path))

    def on_open_file(self):
        # 选择json文件
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择要打开的文件", DATA_DIR, "JSON Files (*.json)"
        )
        if file_path == "":
            return
        self.on_open_file_by_path(file_path)

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
            self.recent_file_manager.add_recent_file(Path(file_path))
        else:
            # 如果用户取消了保存操作
            log("Save operation cancelled.")

    def on_test_exception(self):
        raise Exception("测试异常")

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
        log("dropEvent", event)
        self.is_dragging_file = False
        self.is_dragging_file_valid = False

        for url in event.mimeData().urls():
            log(url)
            file_path: str = url.toLocalFile()
            log(file_path)
            if file_path.endswith(".json"):
                try:
                    load_data = json.loads(read_file(Path(file_path)))

                    if "nodes" not in load_data:
                        # 不是合法的节点图文件
                        QMessageBox.warning(
                            self,
                            "错误",
                            f"{file_path} 文件内容不正确，无法打开。",
                            QMessageBox.Ok,
                        )
                        return
                    self.node_manager.add_from_dict(
                        load_data, self.dragging_file_location
                    )
                    event.acceptProposedAction()
                    break
                except Exception as e:
                    log(e)
                    QMessageBox.warning(
                        self,
                        "错误",
                        f"{file_path} 文件内容不正确，无法打开。",
                        QMessageBox.Ok,
                    )

    @staticmethod
    def on_about():
        # 创建一个消息框
        msg_box = QMessageBox()
        if platform.system() == "Darwin":
            msg_box.setWindowIcon(QIcon("assets/favicon.ico"))
        elif platform.system() == "Windows":
            msg_box.setWindowIcon(QIcon(":/favicon.ico"))
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
        if platform.system() == "Darwin":
            msg_box.setWindowIcon(QIcon("assets/favicon.ico"))
        elif platform.system() == "Windows":
            msg_box.setWindowIcon(QIcon(":/favicon.ico"))
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
                    "9. 旋转节点：对准一个节点旋转滚轮",
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
        QDesktopServices.openUrl(QUrl("https://www.bilibili.com/video/BV1hmHKeDE9D"))

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

        is_press_toolbar = self.toolbar.on_click(point_view_location)
        if is_press_toolbar:
            log("按到了toolbar")
            return

        point_world_location = self.camera.location_view2world(point_view_location)
        self.toolbar.nodes = []
        self.is_dragging = True
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

            if is_click_on_node:
                assert click_node is not None
                if is_have_selected_node:
                    # C
                    if click_node.is_selected:
                        # 如果点击的节点属于被上次选中的节点中，那么整体移动
                        pass
                    else:
                        # 取消选择所有节点
                        for node in self.node_manager.nodes:
                            node.is_selected = False
                        # 单击选择
                        click_node.is_selected = True
                else:
                    # D
                    click_node.is_selected = True
            else:
                # A B
                self.is_selecting = True
                self.select_start_location = point_world_location.clone()
                self.select_rectangle = None
                # 取消选择所有节点
                for node in self.node_manager.nodes:
                    node.is_selected = False
                pass

            # 为移动做准备
            self.last_move_location = point_world_location.clone()

        elif a0.button() == Qt.MouseButton.RightButton:
            # 如果是在节点上开始右键的，那么就开始连线
            # 如果是在空白上开始右键的，那么就开始切割线
            # TODO: 多个框选连线

            self.mouse_right_location = point_world_location
            self.mouse_right_start_location = point_world_location.clone()
            # 开始连线
            self.is_cutting = True
            for node in self.node_manager.nodes:
                if node.body_shape.is_contain_point(point_world_location):
                    self.connect_from_node = node
                    log("开始连线")
                    self.is_cutting = False
                    # 加特效
                    self.effect_manager.add_effect(
                        EffectRectangleFlash(15, node.body_shape.clone())
                    )
                    break
            pass

    def mouseMoveEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        mouse_view_location = NumberVector(a0.pos().x(), a0.pos().y())
        mouse_world_location = self.camera.location_view2world(mouse_view_location)

        self.mouse_location = NumberVector(a0.x(), a0.y())

        if self.is_dragging:
            if a0.buttons() == Qt.MouseButton.LeftButton:
                # 如果是左键，移动节点或者框选
                if self.is_selecting:
                    # 框选
                    # HACK: 踩坑 location作为引用传递，导致修改了原来的对象被修改！
                    self.select_rectangle = Rectangle(
                        self.select_start_location.clone(),
                        mouse_world_location.x - self.select_start_location.x,
                        mouse_world_location.y - self.select_start_location.y,
                    )
                    # 找到在框选范围内的所有节点
                    for node in self.node_manager.nodes:
                        node.is_selected = node.body_shape.is_collision(
                            self.select_rectangle
                        )
                else:
                    # 移动

                    # 当前帧距离上一帧的 鼠标移动向量
                    mouse_d_location = mouse_world_location - self.last_move_location
                    for node in self.node_manager.nodes:
                        if node.is_selected:
                            # new_left_top = mouse_world_location - node.dragging_offset
                            # d_location = (
                            #     new_left_top - node.body_shape.location_left_top
                            # )
                            # node.move(d_location)
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
                        if node.body_shape.is_contain_point(mouse_world_location):
                            self.connect_to_node = node
                            break

    def mouseReleaseEvent(self, a0: QMouseEvent | None):
        assert a0 is not None
        self.is_dragging = False
        mouse_view_location = NumberVector(a0.pos().x(), a0.pos().y())

        if a0.button() == Qt.MouseButton.LeftButton:
            # 结束框选
            if self.is_selecting:
                self.is_selecting = False
            # 是否需要显示toolbar（如果是在toolbar上弹起的，就不显示）
            if not self.toolbar.is_click_inside(mouse_view_location):
                # 显示toolbar
                self.toolbar.nodes = [
                    node for node in self.node_manager.nodes if node.is_selected
                ]
                # 设定框的位置为鼠标释放位置并往右下角偏移一点点
                self.toolbar.body_shape.location_left_top = (
                    mouse_view_location + NumberVector(20, 20)
                )
            else:
                # 隐藏toolbar，直接让其移动到视野之外解决
                self.toolbar.body_shape.location_left_top = NumberVector(-1000, -1000)
                self.toolbar.nodes = []
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
                self.effect_manager.add_effect(EffectCircleExpand(15, click_location))
            else:
                # 在节点上左键是编辑文字
                text, ok = QInputDialog.getText(
                    self, "编辑节点文字", "输入新的文字:", text=select_node.inner_text
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

    def wheelEvent(self, a0: QWheelEvent | None):
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

    def keyPressEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        key = a0.key()

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
                    self,
                    "编辑节点文字",
                    "输入新的文字:",
                    text=self.node_manager.cursor_node.inner_text,
                )
                if ok:
                    self.node_manager.cursor_node.inner_text = text
                    self.node_manager.update_lines()

        elif key == Qt.Key.Key_Left:
            self.node_manager.move_cursor("left")
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Right:
            self.node_manager.move_cursor("right")
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Up:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.rotate_grow_direction(False)
                return
            self.node_manager.move_cursor("up")
            self.node_manager.grow_node_cancel()
        elif key == Qt.Key.Key_Down:
            if self.node_manager.is_grow_node_prepared():
                self.node_manager.rotate_grow_direction(True)
                return
            self.node_manager.move_cursor("down")
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

        # 框选区域
        if self.is_selecting and self.select_rectangle is not None:
            PainterUtils.paint_rect(
                painter,
                self.camera.location_world2view(
                    self.select_rectangle.location_left_top
                ),
                self.select_rectangle.width * self.camera.current_scale,
                self.select_rectangle.height * self.camera.current_scale,
                QColor(255, 255, 255, 20),
                QColor(255, 255, 255, 128),
                2,
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
        paint_context = PaintContext(
            ProjectGraphPainter(painter), self.camera, self.mouse_location
        )

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
            PainterUtils.paint_rect(
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
        pass


def my_except_hook(
    exctype: type[BaseException], value: BaseException, tb: TracebackType
) -> None:
    if exctype is KeyboardInterrupt:
        sys.exit(0)

    print("error!!!")
    log("\n".join(traceback.format_exception(exctype, value, tb)))
    print(logs)
    # 用tkinter弹出错误信息，用输入框组件显示错误信息
    import tkinter as tk

    root = tk.Tk()
    root.title("error!")
    tk.Label(root, text="出现异常！").pack()
    t = tk.Text(root, height=10, width=50)
    for line in logs:
        t.insert(tk.END, line + "\n")
    t.pack()
    tk.Button(root, text="确定", command=root.destroy).pack()
    tk.Button(root, text="退出", command=sys.exit).pack()
    root.mainloop()


def main():
    # 确保数据目录存在
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        with open(os.path.join(DATA_DIR, "settings.json"), "w", encoding="utf-8") as f:
            f.write("{}")

    sys.excepthook = my_except_hook

    app = QApplication(sys.argv)
    app.setWindowIcon(QIcon("./assets/favicon.ico"))

    canvas = Canvas()
    canvas.show()

    sys.exit(app.exec_())
