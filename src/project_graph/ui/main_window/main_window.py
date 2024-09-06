import json
import platform
import subprocess
from functools import partial
from pathlib import Path

from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import (
    QDragEnterEvent,
    QFont,
    QIcon,
    QMouseEvent,
    QPaintEvent,
    QWheelEvent,
)
from PyQt5.QtWidgets import (
    QAction,
    QApplication,
    QDesktopWidget,
    QDialog,
    QFileDialog,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QVBoxLayout,
)

from project_graph.app_dir import DATA_DIR
from project_graph.camera import Camera
from project_graph.data_struct.number_vector import NumberVector
from project_graph.effect.effect_manager import EffectManager
from project_graph.entity.entity_node import EntityNode
from project_graph.entity.node_link import NodeLink
from project_graph.logging import log
from project_graph.node_manager.node_manager import NodeManager
from project_graph.recent_file_manager import RecentFileManager
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.status_text.status_text import STATUS_TEXT
from project_graph.toolbar.toolbar import Toolbar
from project_graph.ui.panel_about import show_about_panel
from project_graph.ui.panel_export_text import show_text_export_dialog
from project_graph.ui.panel_help import show_help_panel
from project_graph.ui.panel_import_text import show_text_import_dialog
from project_graph.ui.panel_physics_settings import show_physics_settings
from project_graph.ui.panel_serialize_test import show_serialize_dialog
from project_graph.ui.panel_visual_settings import show_visual_settings

from . import (
    main_drag_file_events,
    main_key_events,
    main_mouse_events,
    main_paint_event,
)


class Canvas(QMainWindow):
    def __init__(self):
        super().__init__()
        # 允许拖拽文件到窗口
        self.setAcceptDrops(True)
        # 设置鼠标追踪，否则无法捕捉鼠标移动事件，只有按下才能捕捉到了
        self.setMouseTracking(True)

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

        # ====== 鼠标事件相关
        self.is_pressing = False
        """当前鼠标是否按下（左中右任意一个是否按下）"""
        self.mouse_location = NumberVector.zero()
        """鼠标当前位置"""
        self.mouse_location_last_middle_button = NumberVector.zero()
        """鼠标上一次按下中键的位置"""
        self.mouse_location_last_left_button = NumberVector.zero()
        """鼠标上一次按下左键的位置"""
        self.is_last_moved = False
        """是否上一次进行了移动节点的操作"""

        # ====== 键盘事件相关
        self.pressing_keys: set[int] = set()
        """当前按下的键"""

        # ====== 连线/断开 相关的操作
        self.connect_from_nodes: list[EntityNode] = []
        self.connect_to_node: EntityNode | None = None
        self.mouse_right_location: NumberVector = NumberVector.zero()
        """鼠标右键的当前位置"""
        self.mouse_right_start_location: NumberVector = NumberVector.zero()
        """右键开始拖拽前按下的位置"""

        self.is_cutting = False
        """准备要被切断的线"""
        self.warning_links: list[NodeLink] = []
        """准备要被切断的连接"""
        self.warning_nodes: list[EntityNode] = []
        """准备要删除的节点"""

        # ====== 框选相关
        self.is_selecting = False
        """框选的矩形"""
        self.select_start_location: NumberVector = NumberVector.zero()
        """框选的矩形的左上角位置（世界坐标）"""
        self.last_move_location = NumberVector.zero()
        """在框选拖动移动时，上一帧鼠标的位置（用于计算上一帧到当前帧的向量）（世界坐标）"""

        self.selected_links: list[NodeLink] = []
        """选择的连接"""

        # ====== 拖拽文件进入窗口相关
        self.is_dragging_file = False
        """是否文件正在拖拽悬浮在窗口上"""
        self.is_dragging_file_valid = False
        """是否文件拖拽的有效文件"""

        self.dragging_file_location = NumberVector.zero()
        """拖拽文件悬浮在窗口上的世界位置"""

        # 最后再初始化UI
        self.init_ui()
        self.init_toolbar()
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
        # 重做
        redo_action = QAction("重做", self)
        redo_action.triggered.connect(self.node_manager.clear_all)

        # 设置快捷键
        open_action.setShortcut("Ctrl+O")
        save_action.setShortcut("Ctrl+S")
        open_recent_action.setShortcut("Ctrl+R")

        file_menu.addAction(open_action)
        file_menu.addAction(save_action)
        file_menu.addAction(open_recent_action)
        file_menu.addAction(redo_action)

        # 视图菜单
        view_menu = menubar.addMenu("视图")
        assert view_menu is not None
        # 重置位置
        reset_view_action = QAction("重置位置", self)
        reset_view_action.triggered.connect(self.reset_view)
        view_menu.addAction(reset_view_action)
        # 重置缩放
        reset_scale_action = QAction("重置缩放", self)
        reset_scale_action.triggered.connect(self.reset_scale)
        view_menu.addAction(reset_scale_action)

        # 帮助说明菜单
        help_menu = menubar.addMenu("帮助")
        assert help_menu is not None
        # 帮助说明
        help_action = QAction("帮助说明", self)
        help_action.triggered.connect(show_help_panel)
        # 关于
        about_action = QAction("关于", self)
        about_action.triggered.connect(show_about_panel)
        help_menu.addAction(help_action)
        help_menu.addAction(about_action)

        # 打开缓存文件夹
        cache_folder_action = QAction("打开缓存文件夹", self)
        cache_folder_action.triggered.connect(self.open_cache_folder)
        help_menu.addAction(cache_folder_action)

        # 设置
        settings_menu = menubar.addMenu("设置")
        assert settings_menu is not None

        show_settings = QAction("显示设置", self)
        show_settings.triggered.connect(show_visual_settings)

        physics_settings = QAction("物理设置", self)
        physics_settings.triggered.connect(show_physics_settings)

        save_settings = QAction("将设置保存", self)
        save_settings.triggered.connect(SETTING_SERVICE.save_settings)

        settings_menu.addAction(show_settings)
        settings_menu.addAction(physics_settings)
        settings_menu.addAction(save_settings)

        # 测试菜单
        test_menu = menubar.addMenu("测试")
        assert test_menu is not None
        # 抛出异常
        test_exception_action = QAction("抛出异常", self)
        test_exception_action.triggered.connect(self.on_test_exception)
        test_menu.addAction(test_exception_action)
        # 复制摄像机位置
        test_copy_camera_action = QAction("复制摄像机位置", self)
        test_copy_camera_action.triggered.connect(self.on_copy_camera)
        test_menu.addAction(test_copy_camera_action)
        # 导出纯文本
        text_exporter_action = QAction("导出纯文本", self)
        text_exporter_action.triggered.connect(
            partial(show_text_export_dialog, node_manager=self.node_manager)
        )
        test_menu.addAction(text_exporter_action)
        # 通过纯文本生成节点图
        text_importer_action = QAction("通过纯文本生成节点图", self)
        text_importer_action.triggered.connect(
            partial(show_text_import_dialog, node_manager=self.node_manager)
        )
        test_menu.addAction(text_importer_action)
        # 查看当前舞台序列化信息
        test_serialize_action = QAction("查看当前舞台序列化信息", self)
        test_serialize_action.triggered.connect(
            partial(show_serialize_dialog, node_manager=self.node_manager)
        )
        test_menu.addAction(test_serialize_action)

        # 状态栏
        status_bar = self.statusBar()
        assert status_bar is not None
        self.status_bar = status_bar
        # 字体
        status_font = QFont()
        status_font.setPointSize(12)
        status_font.setStyleHint(QFont.StyleHint.System)
        status_bar.setFont(status_font)
        # status_color = STYLE_SERVICE.style.details_debug_text_color
        # style_sheet = f"color: rgb({status_color.red()}, {status_color.green()}, {status_color.blue()});"
        # 这个地方可能需要实时监测设置的变化，然后更新样式
        style_sheet = "color: rgb(206, 145, 120);"
        status_bar.setStyleSheet(style_sheet)  # 将文字颜色设置为红色
        status_bar.showMessage(STATUS_TEXT["normal"])

    def init_toolbar(self):
        self.toolbar.tool_delete_node.set_bind_event_function(
            self._delete_current_select_node
        )
        # 弹出一个框说还没有实现这个功能
        self.toolbar.tool_null.set_bind_event_function(
            partial(self.show_message_box, "工具栏中的这个功能还没有做好")
        )
        self.toolbar.tool_reverse_link.set_bind_event_function(
            partial(self.node_manager.reverse_links, self.selected_links)
        )
        # 对齐功能
        self.toolbar.tool_align_col_center.set_bind_event_function(
            self.node_manager.align_nodes_col_center
        )
        self.toolbar.tool_align_col_left.set_bind_event_function(
            self.node_manager.align_nodes_col_left
        )
        self.toolbar.tool_align_col_right.set_bind_event_function(
            self.node_manager.align_nodes_col_right
        )
        self.toolbar.tool_align_row_center.set_bind_event_function(
            self.node_manager.align_nodes_row_center
        )
        pass

    def show_message_box(self, message: str):
        """显示一个消息框"""
        msg_box = QMessageBox()
        msg_box.setWindowTitle("project-graph 消息")
        msg_box.setText(message)
        msg_box.exec_()

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

        # 先更新一下
        self.recent_file_manager.update_recent_files_list()

        for recent_file in self.recent_file_manager.recent_files_list:
            file_path = recent_file.file_path
            last_opened_time = recent_file.last_opened_time
            size = recent_file.size
            button = QPushButton(
                f"{file_path}  ({last_opened_time.strftime('%Y-%m-%d %H:%M:%S')}, {size}B)"
            )

            def click_function(fp: Path):
                self.on_open_file_by_path(str(fp))
                dialog.close()

            button.clicked.connect(partial(click_function, fp=file_path))
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
            save_data: dict = self.node_manager.dump_all()

            # 确保文件扩展名为 .json
            if not file_path.endswith(".json"):
                file_path += ".json"

            with open(file_path, "w") as f:
                json.dump(save_data, f)
            self.recent_file_manager.add_recent_file(Path(file_path))
        else:
            # 如果用户取消了保存操作
            log("Save operation cancelled.")

    def reset_view(self):
        """重置视角"""
        self.camera.location = NumberVector.zero()

    def reset_scale(self):
        """重置缩放"""
        self.camera.target_scale = 1.0

    def on_test_exception(self):
        raise Exception("测试异常")

    def on_copy_camera(self):
        """复制摄像机位置"""
        clip = QApplication.clipboard()
        assert clip is not None
        clip.setText(str(self.camera.location))

    def dragEnterEvent(self, a0: QDragEnterEvent | None):
        assert a0 is not None
        main_drag_file_events.drag_enter_event(self, a0)

    def dragMoveEvent(self, a0):
        assert a0 is not None
        main_drag_file_events.drag_move_event(self, a0)

    def dragLeaveEvent(self, a0):
        assert a0 is not None
        main_drag_file_events.drag_leave_event(self, a0)

    def dropEvent(self, a0):
        assert a0 is not None
        main_drag_file_events.drop_event(self, a0)

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
        # 更新鼠标手势
        if Qt.Key.Key_Space in self.pressing_keys:
            if self.is_pressing:
                self.setCursor(Qt.CursorShape.ClosedHandCursor)
            else:
                self.setCursor(Qt.CursorShape.OpenHandCursor)
        else:
            self.setCursor(Qt.CursorShape.ArrowCursor)
        self.update()

    def mousePressEvent(self, a0: QMouseEvent | None) -> None:
        main_mouse_events.mousePressEvent(self, a0)

    def mouseMoveEvent(self, a0: QMouseEvent | None) -> None:
        main_mouse_events.mouseMoveEvent(self, a0)

    def mouseReleaseEvent(self, a0: QMouseEvent | None) -> None:
        main_mouse_events.mouseReleaseEvent(self, a0)

    def mouseDoubleClickEvent(self, a0: QMouseEvent | None) -> None:
        main_mouse_events.mouseDoubleClickEvent(self, a0)

    def wheelEvent(self, a0: QWheelEvent | None) -> None:
        main_mouse_events.wheelEvent(self, a0)

    def keyPressEvent(self, a0: main_key_events.QKeyEvent | None) -> None:
        main_key_events.keyPressEvent(self, a0)

    def keyReleaseEvent(self, a0: main_key_events.QKeyEvent | None) -> None:
        main_key_events.keyReleaseEvent(self, a0)

    def paintEvent(self, a0: QPaintEvent | None):
        main_paint_event.main_window_paint_event(self, a0)
