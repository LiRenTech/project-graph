import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QMessageBox


def show_about_panel():
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
