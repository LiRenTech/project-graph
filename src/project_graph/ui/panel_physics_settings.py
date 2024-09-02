import platform

from PyQt5.QtCore import Qt
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import QCheckBox, QDialog, QLabel, QSlider, QVBoxLayout

from project_graph.settings.setting_service import SETTING_SERVICE


def show_physics_settings():
    """打开物理设置"""
    dialog = QDialog()

    if platform.system() == "Darwin":
        dialog.setWindowIcon(QIcon("assets/favicon.ico"))
    elif platform.system() == "Windows":
        dialog.setWindowIcon(QIcon(":/favicon.ico"))

    dialog.setWindowTitle("物理设置")
    dialog.setMinimumWidth(500)

    # 设置布局
    layout = QVBoxLayout()

    # 开启节点碰撞
    enable_node_collision_check_box = QCheckBox("开启节点碰撞")
    enable_node_collision_check_box.setChecked(SETTING_SERVICE.is_enable_node_collision)

    def on_change_enable_node_collision(state):
        SETTING_SERVICE.is_enable_node_collision = state == 2

    enable_node_collision_check_box.stateChanged.connect(
        on_change_enable_node_collision
    )
    layout.addWidget(enable_node_collision_check_box)

    # 镜头缩放速度滑动框 数值类型
    layout.addWidget(QLabel("镜头缩放速度"))
    camera_zoom_speed_slider = QSlider(Qt.Orientation.Horizontal)
    camera_zoom_speed_slider.setMinimum(10)
    camera_zoom_speed_slider.setMaximum(20)
    camera_zoom_speed_slider.setValue(int(SETTING_SERVICE.camera_scale_exponent * 10))

    def on_change_camera_zoom_speed(value):
        SETTING_SERVICE.camera_scale_exponent = value / 10

    camera_zoom_speed_slider.valueChanged.connect(on_change_camera_zoom_speed)
    layout.addWidget(camera_zoom_speed_slider)

    # 镜头移动速度滑动框
    layout.addWidget(QLabel("镜头移动速度"))
    camera_move_speed_slider = QSlider(Qt.Orientation.Horizontal)
    camera_move_speed_slider.setMinimum(1)
    camera_move_speed_slider.setMaximum(10)
    camera_move_speed_slider.setValue(SETTING_SERVICE.camera_move_amplitude)

    def on_change_camera_move_speed(value):
        SETTING_SERVICE.camera_move_amplitude = value

    camera_move_speed_slider.valueChanged.connect(on_change_camera_move_speed)
    layout.addWidget(camera_move_speed_slider)
    # 镜头移动摩擦力系数

    layout.addWidget(QLabel("镜头移动摩擦力系数"))
    camera_move_friction_slider = QSlider(Qt.Orientation.Horizontal)
    camera_move_friction_slider.setMinimum(0)
    camera_move_friction_slider.setMaximum(10)
    camera_move_friction_slider.setValue(int(SETTING_SERVICE.camera_move_friction * 10))

    def on_change_camera_move_friction(value):
        SETTING_SERVICE.camera_move_friction = value / 10

    camera_move_friction_slider.valueChanged.connect(on_change_camera_move_friction)
    layout.addWidget(camera_move_friction_slider)

    # 设置布局到对话框
    dialog.setLayout(layout)
    dialog.exec_()
