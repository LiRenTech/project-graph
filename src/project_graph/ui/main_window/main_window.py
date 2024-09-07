import json
import platform
import subprocess
from functools import partial
from pathlib import Path

from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import (
    QColor,
    QDragEnterEvent,
    QFont,
    QIcon,
    QMouseEvent,
    QPaintEvent,
    QWheelEvent,
)
from PyQt5.QtWidgets import (
    QApplication,
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

from project_graph.ai.ai_provider import AIProvider
from project_graph.ai.doubao_provider import DoubaoProvider
from project_graph.ai.openai_provider import OpenAIProvider
from project_graph.ai.request_thread import AIRequestThread
from project_graph.app_dir import DATA_DIR
from project_graph.camera import Camera
from project_graph.data_struct.number_vector import NumberVector
from project_graph.effect.effect_concrete import EffectViewFlash
from project_graph.effect.effect_manager import EffectManager
from project_graph.entity.entity_node import EntityNode
from project_graph.entity.node_link import NodeLink
from project_graph.liren_side.menu import LAction, LMenu, LMenuBar
from project_graph.logging import log
from project_graph.node_manager.node_manager import NodeManager
from project_graph.recent_file_manager import RecentFileManager
from project_graph.settings.setting_service import SETTING_SERVICE
from project_graph.status_text.status_text import STATUS_TEXT
from project_graph.toolbar.toolbar import Toolbar
from project_graph.ui.panel_about import show_about_panel
from project_graph.ui.panel_ai_settings import show_ai_settings
from project_graph.ui.panel_export_text import show_text_export_dialog
from project_graph.ui.panel_help import show_help_panel
from project_graph.ui.panel_import_text import show_text_import_dialog
from project_graph.ui.panel_performence_settings import show_performance_settings
from project_graph.ui.panel_physics_settings import show_physics_settings
from project_graph.ui.panel_serialize_test import show_serialize_dialog
from project_graph.ui.panel_update import show_update_panel
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

        self.on_open_file_by_path(
            str(self.node_manager.file_path), record_history=False
        )  # 一开始打开初始欢迎文件

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
        LMenuBar(
            LMenu(
                title="文件",
                children=(
                    LAction(
                        title="打开新图", action=self.on_open_file, shortcut="Ctrl+O"
                    ),
                    LAction(title="保存", action=self.on_save_file, shortcut="Ctrl+S"),
                    LAction(
                        title="另存为",
                        action=self.on_save_as_new_file,
                        shortcut="Ctrl+Shift+S",
                    ),
                    LAction(
                        title="打开曾经保存的",
                        action=self.open_recent_file,
                        shortcut="Ctrl+R",
                    ),
                    LAction(title="重做", action=self.node_manager.clear_all),
                ),
            ),
            LMenu(
                title="视图",
                children=(
                    LAction(title="重置位置", action=self.reset_view),
                    LAction(title="重置缩放", action=self.reset_scale),
                ),
            ),
            LMenu(
                title="帮助",
                children=(
                    LAction(title="帮助说明", action=show_help_panel),
                    LAction(title="关于", action=show_about_panel),
                    LAction(title="打开缓存文件夹", action=self.open_cache_folder),
                    LAction(title="检查更新", action=show_update_panel),
                ),
            ),
            LMenu(
                title="设置",
                children=(
                    LAction(title="显示设置", action=show_visual_settings),
                    LAction(title="物理设置", action=show_physics_settings),
                    LAction(title="性能设置", action=show_performance_settings),
                    LAction(title="AI设置", action=show_ai_settings),
                    LAction(title="将设置保存", action=SETTING_SERVICE.save_settings),
                ),
            ),
            LMenu(
                title="AI",
                children=(
                    LAction(
                        title="豆包", action=partial(self.request_ai, DoubaoProvider())
                    ),
                    LAction(
                        title="gpt-4o-mini",
                        action=partial(
                            self.request_ai, OpenAIProvider(), "gpt-4o-mini"
                        ),
                    ),
                    LAction(
                        title="net-gpt-3.5-turbo",
                        action=partial(
                            self.request_ai, OpenAIProvider(), "net-gpt-3.5-turbo"
                        ),
                    ),
                    LAction(
                        title=SETTING_SERVICE.custom_ai_model or "自定义模型",
                        enabled=SETTING_SERVICE.custom_ai_model != "",
                        action=partial(
                            self.request_ai,
                            OpenAIProvider(),
                            SETTING_SERVICE.custom_ai_model,
                        ),
                    ),
                    LAction(
                        title="设置自定义 OpenAI 模型",
                        action=self.custom_ai_model,
                    ),
                ),
            ),
            LMenu(
                title="测试",
                children=(
                    LAction(title="抛出异常", action=self.on_test_exception),
                    LAction(title="复制摄像机位置", action=self.on_copy_camera),
                    LAction(
                        title="导出纯文本",
                        action=partial(
                            show_text_export_dialog, node_manager=self.node_manager
                        ),
                    ),
                    LAction(
                        title="通过纯文本生成节点图",
                        action=partial(
                            show_text_import_dialog, node_manager=self.node_manager
                        ),
                    ),
                    LAction(
                        title="查看当前舞台序列化信息",
                        action=partial(
                            show_serialize_dialog, node_manager=self.node_manager
                        ),
                    ),
                ),
            ),
        ).apply_to_qt_window(self)

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

    def on_open_file_by_path(self, file_path: str, record_history=True):
        """
        根据文件路径打开文件
        """
        # 读取json文件
        with open(file_path, "r", encoding="utf-8") as f:
            load_data = json.loads(f.read())
            self.node_manager.load_from_dict(load_data)
            self.node_manager.file_path = Path(file_path)
            if record_history:
                self.recent_file_manager.add_recent_file(Path(file_path))
        self.node_manager.progress_recorder.reset()

    def on_open_file(self):
        # 选择json文件
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择要打开的文件", DATA_DIR, "JSON Files (*.json)"
        )
        if file_path == "":
            return
        self.on_open_file_by_path(file_path)

    def on_save_file(self):
        """保存"""
        # 意外情况：如果node manager 的path属性没有找到文件，则会报错
        if not self.node_manager.file_path.exists():
            self.on_save_as_new_file()
            return
        else:
            with open(self.node_manager.file_path, "w") as f:
                save_data: dict = self.node_manager.dump_all()
                json.dump(save_data, f)
            self.node_manager.progress_recorder.reset()
            self.effect_manager.add_effect(EffectViewFlash(30, QColor(0, 0, 0)))

            self.camera.release_move(NumberVector(0, -1))

    def on_save_as_new_file(self):
        """另存为"""
        file_path, _ = QFileDialog.getSaveFileName(
            self, "另存为", "", "JSON Files (*.json);;All Files (*)"
        )
        if file_path:
            # 如果用户选择了文件并点击了另存为按钮
            save_data: dict = self.node_manager.dump_all()

            # 确保文件扩展名为 .json
            if not file_path.endswith(".json"):
                file_path += ".json"

            with open(file_path, "w") as f:
                json.dump(save_data, f)
            self.recent_file_manager.add_recent_file(Path(file_path))
            self.node_manager.progress_recorder.reset()
        else:
            # 如果用户取消了另存为操作
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

    def request_ai(self, provider: AIProvider, *args):
        selected_nodes = [node for node in self.node_manager.nodes if node.is_selected]
        thread = None

        def on_finished(nodes):
            nonlocal thread
            for dic in nodes:
                self.node_manager.add_from_dict(
                    {"nodes": [dic]},
                    NumberVector(
                        dic["body_shape"]["location_left_top"][0],
                        dic["body_shape"]["location_left_top"][1],
                    ),
                    refresh_uuid=False,
                )
                entity_node = self.node_manager.get_node_by_uuid(dic["uuid"])
                assert entity_node is not None
                for node in selected_nodes:
                    self.node_manager.connect_node(node, entity_node)
            # 线程执行完毕后，销毁 `self.thread`
            thread = None

        def on_error(error_message):
            nonlocal thread
            QMessageBox.critical(self, "AI 请求失败", error_message)
            # 出错时，也销毁 `self.thread`
            thread = None

        if thread is None:  # 确保没有线程在运行
            thread = AIRequestThread(provider, self.node_manager, *args)
            thread.finished.connect(on_finished)
            thread.error.connect(on_error)
            thread.start()

    def custom_ai_model(self):
        """自定义 OpenAI 模型"""
        # 弹窗让用户输入模型名称
        text, ok = QInputDialog.getText(
            self,
            "输入模型名称",
            "请输入模型名称 (例如 gpt-4o-mini)",
            text=SETTING_SERVICE.custom_ai_model,
        )
        if ok:
            SETTING_SERVICE.custom_ai_model = text
            SETTING_SERVICE.save_settings()
            self.init_ui()

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
        # 把camera里的特效加到effect_manager里
        for effect in self.camera.prepare_effect:
            self.effect_manager.add_effect(effect)
        self.camera.prepare_effect.clear()

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
