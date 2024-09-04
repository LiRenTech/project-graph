import platform
import typing
from functools import partial

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QPushButton, QTextEdit, QVBoxLayout

if typing.TYPE_CHECKING:
    from project_graph.node_manager import NodeManager

placeholder_text = """请输入文本，每行一个节点，一个缩进四个空格
如：
节点1
    子节点2
        a
        b
    子节点3
        c
节点2
    子节点1
"""


def show_text_import_dialog(node_manager: "NodeManager"):
    dialog = QDialog()
    print(node_manager)

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("通过文本生成节点")
    dialog.setMinimumWidth(500)
    # 设置布局
    layout = QVBoxLayout()
    # 多行输入框

    text_edit = QTextEdit()
    text_edit.setPlaceholderText(placeholder_text)
    layout.addWidget(text_edit)
    # 按钮
    button_ok = QPushButton("确定")

    button_ok.clicked.connect(partial(import_text, node_manager, text_edit))

    layout.addWidget(button_ok)

    dialog.setLayout(layout)
    dialog.exec_()
    pass


def import_text(node_manager: "NodeManager", text: QTextEdit):
    node_manager.text_importer.update_node_by_text(text.toPlainText())
