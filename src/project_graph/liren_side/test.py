import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDesktopWidget, QMainWindow

from project_graph.liren_side.app import App
from project_graph.liren_side.components import World


def init(window: QMainWindow):
    # 设置窗口标题和尺寸
    window.setWindowTitle("计划-投射")
    if platform.system() == "Darwin":
        window.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows" or platform.system() == "Linux":
        window.setWindowIcon(QIcon(":/favicon.ico"))
    # 获取屏幕可用空间（macOS上会有titlebar占据一部分空间）
    screen_geometry = QDesktopWidget().availableGeometry()

    # 计算新的宽度和高度（长宽各取屏幕的百分之八十）
    new_width = screen_geometry.width() * 0.8
    new_height = screen_geometry.height() * 0.8

    # 计算窗口应该移动到的新位置
    new_left = (screen_geometry.width() - new_width) / 2
    new_top = (screen_geometry.height() - new_height) / 2 + screen_geometry.top()

    # 移动窗口到新位置
    window.setGeometry(int(new_left), int(new_top), int(new_width), int(new_height))


if __name__ == "__main__":
    App(World(), init=init).run()
