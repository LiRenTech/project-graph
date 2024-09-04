"""
规定不同风格的主题样式
主要是颜色
方便将颜色统一管理在一个地方，修改
"""

from PyQt5.QtGui import QColor

from project_graph.settings.setting_service import SETTING_SERVICE


class ThemeStyle:
    def __init__(self):
        """
        默认主题样式
        """
        self.background_color = QColor(43, 43, 43, 255)
        """背景颜色"""

        self.grid_line_color = QColor(51, 51, 51, 255)
        """网格细线"""
        self.grid_bold_line_color = QColor(102, 102, 102, 255)
        """网格粗线"""
        self.details_debug_text_color = QColor(255, 255, 255, 100)
        """左上角调试信息颜色"""

        self.cutting_warning_line_color = QColor(255, 0, 0, 255)
        """红色警告切断线，跟随鼠标的"""

        self.warning_link_cover_color = QColor(255, 0, 0, 128)
        """准备切断时附着在link上的颜色"""
        self.selecting_link_cover_color = QColor(0, 255, 0, 50)
        """所有选择住的link的颜色，默认是绿色的"""
        self.warning_node_cover_fill_color = QColor(255, 0, 0, 128)
        self.warning_node_cover_stroke_color = QColor(255, 0, 0, 255)

        self.connecting_line_color = QColor(255, 255, 255)
        """连接线颜色，鼠标正在移动的时候的线"""

        self.select_rectangle_border_color = QColor(255, 255, 255, 128)
        """选择矩形边框颜色"""
        self.select_rectangle_fill_color = QColor(255, 255, 255, 20)
        """选择矩形填充颜色"""
        self.select_line_color = QColor(0, 255, 0, 50)
        """选择矩形对角线颜色"""
        self.select_line_rect_color = QColor(0, 255, 0, 128)
        """只选择连线的时候矩形边框颜色"""

        # ==== 节点相关
        self.node_border_color = QColor(255, 255, 255)
        self.node_fill_color = QColor(51, 51, 51)
        self.node_text_color = QColor(255, 255, 255)
        # ==== link相关

        pass

    pass


class StyleService:
    def __init__(self):
        self.styles = [ThemeStyle(), ThemeStyle(), ThemeStyle()]
        """多种主题样式"""

        pass

    def get_current_style(self):
        """
        获取当前主题样式
        """
        if SETTING_SERVICE.theme_style >= len(self.styles):
            return self.styles[0]
        return self.styles[SETTING_SERVICE.theme_style]

    pass


STYLE_SERVICE = StyleService()
