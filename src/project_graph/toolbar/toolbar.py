from typing import List
from project_graph.data_struct.number_vector import NumberVector
from project_graph.data_struct.rectangle import Rectangle
from project_graph.entity.entity_node import EntityNode
from project_graph.logging import log
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext
from PyQt5.QtGui import QColor


class Tool:
    """
    工具类，只在工具栏中使用
    """

    VIEW_SIZE = 50
    """工具栏图标大小，正方形边长 px"""

    def __init__(self, icon_file_name: str) -> None:
        self.icon_file_name = icon_file_name
        """工具栏图标文件名, 包含后缀名 ‘delete.png’ """

        self.bind_event_function = lambda: None
        """绑定事件函数，当工具被点击时调用"""

        pass

    def set_bind_event_function(self, func) -> None:
        """设置绑定事件函数"""
        self.bind_event_function = func

    pass


class Toolbar(Paintable):
    """
    选择节点后弹出的工具栏，整个应用中只能有一个
    给每个工具栏绑定具体的事件的地方在 上层的 MainWindow 中
    """

    HEIGHT = 50
    IMAGE_SIZE = 30

    def __init__(self) -> None:
        super().__init__()

        self.nodes: list[EntityNode] = []
        """工具栏引用的节点"""

        self.tool_list: List[Tool] = [
            Tool("icon_delete.png"),
        ]
        """工具列表"""

        self.body_shape = Rectangle(
            location_left_top=NumberVector(0, 0),
            width=Tool.VIEW_SIZE * len(self.tool_list),
            height=self.HEIGHT,
        )
        """工具栏矩形形状，注意这个是view坐标系的"""

    def paint(self, context: PaintContext) -> None:
        if self.nodes:
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                self.body_shape.location_left_top,
                Tool.VIEW_SIZE * len(self.tool_list),
                Tool.VIEW_SIZE,
                QColor(20, 20, 20, 200),
                radius=Tool.VIEW_SIZE / 2,
            )
            for i, tool in enumerate(self.tool_list):
                image_left_top = (
                    self.body_shape.location_left_top
                    + NumberVector(Tool.VIEW_SIZE * i, 0)
                    + (Tool.VIEW_SIZE - self.IMAGE_SIZE) / 2
                )

                PainterUtils.paint_image(
                    context.painter.q_painter(),
                    image_left_top,
                    f":/{tool.icon_file_name}",
                    self.IMAGE_SIZE,
                    self.IMAGE_SIZE,
                )

    def get_components(self) -> List[Paintable]:
        return super().get_components()

    def is_click_inside(self, view_location: NumberVector) -> bool:
        """判断点击位置是否在工具栏内部"""
        return self.body_shape.is_contain_point(view_location)

    def on_click(self, view_location: NumberVector) -> bool:
        """点击工具栏，触发对应工具的事件"""
        if not self.is_click_inside(view_location):
            return False

        index = int(
            (view_location.x - self.body_shape.location_left_top.x) / Tool.VIEW_SIZE
        )
        log(f"click tool {index}")

        if 0 <= index < len(self.tool_list):
            self.tool_list[index].bind_event_function()
            return True

        return False
