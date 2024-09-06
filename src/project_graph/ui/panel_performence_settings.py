import platform

from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QDialog, QLabel, QSlider, QVBoxLayout

from project_graph.settings.setting_service import SETTING_SERVICE


def show_performance_settings():
    """打开性能设置"""
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("性能设置")
    dialog.setMinimumWidth(500)

    # 设置布局
    layout = QVBoxLayout()

    # 设置历史节点数量
    layout.addWidget(QLabel("历史记录数量"))
    layout.addWidget(QLabel("建议最小10，最大500"))

    history_node_count_slider = QSlider(Qt.Orientation.Horizontal)
    history_node_count_slider.setMinimum(10)
    history_node_count_slider.setMaximum(500)
    history_node_count_slider.setValue(SETTING_SERVICE.history_max_size)

    # 添加一个QLabel来显示当前数值
    current_value_label = QLabel(f"当前数值: {SETTING_SERVICE.history_max_size}")
    layout.addWidget(current_value_label)

    def on_change_history_node_count(value):
        SETTING_SERVICE.history_max_size = value
        current_value_label.setText(f"当前数值: {value}")  # 更新QLabel的文本

    history_node_count_slider.valueChanged.connect(on_change_history_node_count)
    layout.addWidget(history_node_count_slider)

    # 设置布局到对话框
    dialog.setLayout(layout)
    dialog.exec_()
