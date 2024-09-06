import json
import platform
import typing

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QTextEdit, QVBoxLayout

if typing.TYPE_CHECKING:
    from project_graph.node_manager.node_manager import NodeManager


def show_serialize_dialog(node_manager: "NodeManager"):
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("序列化信息测试")
    dialog.setMinimumWidth(1000)
    dialog.setMinimumHeight(1000)
    # 自动全屏
    dialog.setWindowFlags(dialog.windowFlags())
    # 设置布局
    layout = QVBoxLayout()
    # 多行输入框

    text_edit = QTextEdit()
    # 设置输入框里的文本
    json_string = json.dumps(node_manager.dump_all(), indent=4)
    text_edit.setText(json_string)
    layout.addWidget(text_edit)
    dialog.setLayout(layout)
    dialog.exec_()
    pass
