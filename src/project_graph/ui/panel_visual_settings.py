import platform

from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QCheckBox, QComboBox, QDialog, QLabel, QVBoxLayout

from project_graph.settings.setting_service import SETTING_SERVICE


def show_visual_settings():
    """打开显示设置"""
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("显示设置")
    dialog.setMinimumWidth(500)

    # 设置布局
    layout = QVBoxLayout()

    # 添加一些示例控件
    layout.addWidget(QLabel("线段方式"))
    line_style_combo_box = QComboBox()
    line_style_combo_box.addItem("贝塞尔曲线")
    line_style_combo_box.addItem("直线")
    line_style_combo_box.setCurrentIndex(SETTING_SERVICE.line_style)

    def on_change_line_style(index):
        SETTING_SERVICE.line_style = index

    line_style_combo_box.currentIndexChanged.connect(on_change_line_style)
    layout.addWidget(line_style_combo_box)

    layout.addWidget(QLabel("主题颜色"))
    theme_style_combo_box = QComboBox()
    theme_style_combo_box.addItem("德古拉灰")
    theme_style_combo_box.addItem("论文白")
    theme_style_combo_box.addItem("马卡龙色系")
    theme_style_combo_box.addItem("黑客帝国")
    theme_style_combo_box.addItem("科技蓝主题")
    theme_style_combo_box.addItem("Catppuccin Mocha")
    theme_style_combo_box.setCurrentIndex(SETTING_SERVICE.theme_style)

    def on_change_theme_style(index):
        SETTING_SERVICE.theme_style = index

    theme_style_combo_box.currentIndexChanged.connect(on_change_theme_style)
    layout.addWidget(theme_style_combo_box)

    # 网格显示开关
    show_grid_check_box = QCheckBox("显示网格")
    show_grid_check_box.setChecked(SETTING_SERVICE.is_show_grid)

    def on_change_show_grid(state):
        SETTING_SERVICE.is_show_grid = state == 2

    show_grid_check_box.stateChanged.connect(on_change_show_grid)
    layout.addWidget(show_grid_check_box)

    # 显示调试信息
    show_debug_info_check_box = QCheckBox("显示调试信息")
    show_debug_info_check_box.setChecked(SETTING_SERVICE.is_show_debug_text)

    def on_change_show_debug_info(state):
        SETTING_SERVICE.is_show_debug_text = state == 2

    show_debug_info_check_box.stateChanged.connect(on_change_show_debug_info)
    layout.addWidget(show_debug_info_check_box)

    # 设置布局到对话框
    dialog.setLayout(layout)
    dialog.exec_()
    pass
