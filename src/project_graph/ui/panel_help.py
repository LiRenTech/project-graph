import platform

from PyQt5.QtCore import QUrl
from PyQt5.QtGui import QDesktopServices, QIcon
from PyQt5.QtWidgets import QMessageBox, QPushButton


def show_help_panel():
    # 创建一个消息框
    msg_box = QMessageBox()

    if platform.system() == "Darwin":
        msg_box.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        msg_box.setWindowIcon(QIcon(":/favicon.ico"))

    msg_box.setIcon(QMessageBox.Information)
    msg_box.setWindowTitle("project-graph 帮助说明")
    msg_box.setText(
        "\n\n".join(
            [
                "1. 创建节点：双击空白部分",
                "2. 编辑节点：双击节点，出现输入框，按住Ctrl键可以编辑节点详细信息",
                "3. 移动节点：左键拖拽一个节点，但按住Ctrl键可以带动所有子节点拖动整个树",
                "4. 连接节点：按住右键从一个节点滑动到另一个节点",
                "5. 切断连线：在空白地方按住右键划出一道切割线",
                "6. 删除节点：同样使用切割线切节点来删除",
                "7. 移动视野：W A S D 键 ，或者鼠标中键拖拽",
                "8. 缩放视野：鼠标滚轮",
                "9. 旋转节点：对准一个节点旋转滚轮",
            ]
        )
    )
    # github按钮
    button_github = QPushButton("Github 项目地址")
    msg_box.addButton(button_github, QMessageBox.ActionRole)
    button_github.clicked.connect(_open_github)
    msg_box.setStandardButtons(QMessageBox.Ok)
    # b站按钮
    button_bilibili = QPushButton("bilibili 视频介绍")
    msg_box.addButton(button_bilibili, QMessageBox.ActionRole)
    button_bilibili.clicked.connect(_open_bilibili)

    # 显示消息框
    msg_box.exec_()


def _open_github():
    QDesktopServices.openUrl(QUrl("https://github.com/LiRenTech/project-graph-qt"))


def _open_bilibili():
    QDesktopServices.openUrl(QUrl("https://www.bilibili.com/video/BV1hmHKeDE9D"))
