import json
import platform
import typing

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QLabel, QTextEdit, QVBoxLayout

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

    layout.addWidget(QLabel("舞台信息"))
    # 多行输入框
    text_edit = QTextEdit()
    text_edit.setText(json.dumps(node_manager.dump_all(), indent=4))
    layout.addWidget(text_edit)

    layout.addWidget(QLabel("复制的内容"))
    text_edit_ = QTextEdit()
    text_edit_.setText(json.dumps(node_manager.clone_series, indent=4))
    layout.addWidget(text_edit_)

    dialog.setLayout(layout)
    dialog.exec_()
    pass
