"""
和主窗口拖拽文件相关的函数
"""

import json
import typing
from pathlib import Path

from PyQt5 import QtGui
from PyQt5.QtWidgets import QMessageBox

from project_graph.data_struct.number_vector import NumberVector
from project_graph.logging import log
from project_graph.tools.file_tools import read_file

if typing.TYPE_CHECKING:
    from .main_window import Canvas


def drag_enter_event(self: "Canvas", event: QtGui.QDragEnterEvent):
    """从外部拖拽文件进入窗口"""
    assert event is not None
    self.is_dragging_file = True
    self.is_dragging_file_valid = False
    mimeData = event.mimeData()
    assert mimeData is not None
    file = mimeData.urls()[0].toLocalFile()
    if file.endswith(".json"):
        self.is_dragging_file_valid = True
    event.acceptProposedAction()


def drag_move_event(self: "Canvas", event):
    view_location = NumberVector(event.pos().x(), event.pos().y())
    world_location = self.camera.location_view2world(view_location)
    self.dragging_file_location = world_location.clone()


def drag_leave_event(self: "Canvas", event):
    self.is_dragging_file = False
    self.is_dragging_file_valid = False


def drop_event(self: "Canvas", event):
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
                self.node_manager.add_from_dict(load_data, self.dragging_file_location)
                self.node_manager.save_a_step()
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
