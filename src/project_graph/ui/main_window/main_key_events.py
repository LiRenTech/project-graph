"""
和键盘事件相关的函数
"""

import typing

from PyQt5.QtCore import Qt
from PyQt5.QtGui import QKeyEvent
from PyQt5.QtWidgets import QInputDialog

from project_graph.data_struct.number_vector import NumberVector
from project_graph.status_text.status_text import STATUS_TEXT

if typing.TYPE_CHECKING:
    from .main_window import Canvas


def keyPressEvent(self: "Canvas", a0: QKeyEvent | None):
    assert a0 is not None
    print(a0.key(), a0)
    key: int = a0.key()

    self.pressing_keys.add(key)
    self.status_bar.showMessage(STATUS_TEXT["keyboard"])

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
    elif key == Qt.Key.Key_Delete:
        self.node_manager.delete_nodes(
            [node for node in self.node_manager.nodes if node.is_selected]
        )
        self.toolbar.shift_off()
    elif key == Qt.Key.Key_Space:
        print("space")
    elif key == 16777220:
        # Qt.Key.Key_Enter 这里写这个无效
        # 回车键，如果当前有正在选中的节点，则进入编辑模式
        if self.node_manager.cursor_node is not None:
            self.status_bar.showMessage(STATUS_TEXT["cursor"])
            # 在节点上左键是编辑文字
            text, ok = QInputDialog.getText(
                self,
                "编辑节点文字",
                "输入新的文字:",
                text=self.node_manager.cursor_node.inner_text,
            )
            if ok:
                self.node_manager.edit_node_inner_text(
                    self.node_manager.cursor_node, text
                )
            return
        elif len(self.selected_links) > 0:
            # 统一更改这些线的名称
            place_holder = "?"
            if len(self.selected_links) == 1:
                place_holder = self.selected_links[0].inner_text
            new_name, ok = QInputDialog.getText(
                self, "更改线名称", "输入新的名称:", text=place_holder
            )
            if ok:
                self.node_manager.edit_links_inner_text(self.selected_links, new_name)
                self.selected_links.clear()

    elif key == Qt.Key.Key_Left:
        self.node_manager.move_cursor("left")
        self.node_manager.grow_node_cancel()
        self.status_bar.showMessage(STATUS_TEXT["cursor"])
    elif key == Qt.Key.Key_Right:
        self.node_manager.move_cursor("right")
        self.node_manager.grow_node_cancel()
        self.status_bar.showMessage(STATUS_TEXT["cursor"])
    elif key == Qt.Key.Key_Up:
        if self.node_manager.is_grow_node_prepared():
            self.node_manager.rotate_grow_direction(False)
            self.status_bar.showMessage(STATUS_TEXT["grow"])
            return
        self.node_manager.move_cursor("up")
        self.node_manager.grow_node_cancel()
        self.status_bar.showMessage(STATUS_TEXT["cursor"])
    elif key == Qt.Key.Key_Down:
        if self.node_manager.is_grow_node_prepared():
            self.node_manager.rotate_grow_direction(True)
            self.status_bar.showMessage(STATUS_TEXT["grow"])
            return
        self.node_manager.move_cursor("down")
        self.node_manager.grow_node_cancel()
        self.status_bar.showMessage(STATUS_TEXT["cursor"])
    elif key == Qt.Key.Key_Tab:
        if self.node_manager.is_grow_node_prepared():
            self.node_manager.grow_node_confirm()
            self.status_bar.showMessage(STATUS_TEXT["cursor"])
        else:
            self.node_manager.grow_node()
            self.status_bar.showMessage(STATUS_TEXT["grow"])
    elif key == Qt.Key.Key_Escape:
        if self.node_manager.is_grow_node_prepared():
            self.node_manager.grow_node_cancel()

    elif key == Qt.Key.Key_Z:
        if Qt.Key.Key_Control in self.pressing_keys:
            if Qt.Key.Key_Shift in self.pressing_keys:
                # 取消撤销
                self.node_manager.progress_recorder.ctrl_shift_z()
            else:
                # 撤销
                self.node_manager.progress_recorder.ctrl_z()

    elif key == Qt.Key.Key_Y:
        if Qt.Key.Key_Control in self.pressing_keys:
            # 取消撤销
            self.node_manager.progress_recorder.ctrl_shift_z()


def keyReleaseEvent(self: "Canvas", a0: QKeyEvent | None):
    assert a0 is not None
    key = a0.key()
    if key in self.pressing_keys:
        self.pressing_keys.remove(key)

    if key == Qt.Key.Key_A:
        self.camera.release_move(NumberVector(-1, 0))
    elif key == Qt.Key.Key_S:
        self.camera.release_move(NumberVector(0, 1))
    elif key == Qt.Key.Key_D:
        self.camera.release_move(NumberVector(1, 0))
    elif key == Qt.Key.Key_W:
        self.camera.release_move(NumberVector(0, -1))

    elif key == Qt.Key.Key_Alt:
        # 一旦松开Alt键就取消复制状态
        self.clone_nodes = []
