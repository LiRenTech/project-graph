"""
单例模式

此模块接近底层，尽量不要依赖其他模块
"""


class SettingService:
    def __init__(self):
        """
        初始化默认数值
        """
        self.line_style = 0  # 0: 贝塞尔，1：直线
        self.theme_style = 0

        self.is_show_grid = True
        """是否显示网格"""

        self.is_show_debug_text = True
        """是否显示左上角调试信息"""

        self.is_enable_node_collision = True
        """是否启用节点碰撞检测"""

        self.camera_scale_exponent: float = 1.1
        """缩放指数，越大缩放速度越快, 1~2 """

        self.camera_move_amplitude: int = 2
        """摄像机移动加速度大小 1~10 """

        self.camera_move_friction: float = 0.1
        """摄像机移动的滑动摩擦力系数 0.0~1.0 默认0.1"""

        pass


SETTING_SERVICE = SettingService()
"""
全局唯一单例
"""
