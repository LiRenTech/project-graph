import platform
import typing
from functools import partial

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import (
    QApplication,
    QDialog,
    QLabel,
    QMessageBox,
    QPushButton,
    QTextEdit,
    QVBoxLayout,
)

if typing.TYPE_CHECKING:
    from project_graph.node_manager.node_manager import NodeManager


def show_text_export_dialog(node_manager: "NodeManager"):
    """打开对话"""
    dialog = QDialog()
    print(node_manager)

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("文本内容复制")
    dialog.setMinimumWidth(500)
    # 设置布局
    layout = QVBoxLayout()

    layout.addWidget(QLabel("格式1：Tab缩进格式"))

    text_edit_style = QTextEdit()
    text_edit_style.setPlainText(node_manager.text_exporter.export_all_node_text())
    layout.addWidget(text_edit_style)

    # 复制按钮
    button_style = QPushButton("复制")
    button_style.clicked.connect(
        partial(onclick_button_style1, node_manager=node_manager)
    )
    layout.addWidget(button_style)

    # ===== 2
    layout.addWidget(QLabel("格式2：Markdown格式"))

    text_edit_style = QTextEdit()
    text_edit_style.setPlainText(node_manager.text_exporter.export_all_node_markdown())
    layout.addWidget(text_edit_style)

    # 复制按钮
    button_style = QPushButton("复制")
    button_style.clicked.connect(
        partial(onclick_button_style2, node_manager=node_manager)
    )
    layout.addWidget(button_style)

    dialog.setLayout(layout)
    dialog.exec_()


def onclick_button_style1(node_manager: "NodeManager"):
    clip = QApplication.clipboard()
    assert clip is not None
    clip.setText(node_manager.text_exporter.export_all_node_text())
    # 弹出一个提示框
    QMessageBox.information(None, "提示", "已复制到剪贴板")


def onclick_button_style2(node_manager: "NodeManager"):
    clip = QApplication.clipboard()
    assert clip is not None
    clip.setText(node_manager.text_exporter.export_all_node_markdown())
    # 弹出一个提示框
    QMessageBox.information(None, "提示", "已复制到剪贴板")
