import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QInputDialog, QLabel, QPushButton, QVBoxLayout

from project_graph.settings.setting_service import SETTING_SERVICE


def show_auto_namer_dialog():
    # 不排除以后还有其他命名器的可能，不局限于节点命名器
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("自动命名设置")
    dialog.setMinimumWidth(500)
    # 设置布局
    layout = QVBoxLayout()
    # 多行输入框
    layout.addWidget(QLabel("特殊模板字符串介绍："))
    layout.addWidget(QLabel("{{i}} 表示能自动累加的不重复编号"))
    layout.addWidget(QLabel("{{date}} 表示日期"))
    layout.addWidget(QLabel("{{time}} 表示时间"))
    # 按钮
    button_ok = QPushButton("编辑节点自动命名器模板")

    button_ok.clicked.connect(edit_node_namer_template)

    layout.addWidget(button_ok)

    dialog.setLayout(layout)
    dialog.exec_()
    pass


def edit_node_namer_template():
    text, ok = QInputDialog.getText(
        None,
        "编辑节点文字",
        "输入新的文字:",
        text=SETTING_SERVICE.node_auto_name_template,
    )
    if ok:
        SETTING_SERVICE.node_auto_name_template = text
