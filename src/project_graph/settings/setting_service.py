"""
单例模式

此模块接近底层，尽量不要依赖其他模块
"""


class SettingService:
    def __init__(self):
        self.line_style = 0  # 0: 贝塞尔，1：直线
        self.theme_style = 0

        self.is_show_grid = True
        """是否显示网格"""

        self.is_show_debug_text = True
        """是否显示左上角调试信息"""

        pass


SETTING_SERVICE = SettingService()
"""
全局唯一单例
"""
