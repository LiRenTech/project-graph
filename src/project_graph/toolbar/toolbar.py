from typing import List
from project_graph.data_struct.number_vector import NumberVector
from project_graph.entity.entity_node import EntityNode
from project_graph.paint.paint_utils import PainterUtils
from project_graph.paint.paintables import Paintable, PaintContext
from PyQt5.QtGui import QColor


class Toolbar(Paintable):
    """选择节点后弹出的工具栏，整个应用中只能有一个"""

    HEIGHT = 50
    IMAGE_SIZE = 30

    def __init__(self) -> None:
        super().__init__()
        self.nodes: list[EntityNode] = []
        """工具栏引用的节点"""

    def paint(self, context: PaintContext) -> None:
        if self.nodes:
            options = ["delete", "delete", "delete"]
            PainterUtils.paint_rect(
                context.painter.q_painter(),
                context.mouse_location,
                50 * len(options),
                self.HEIGHT,
                QColor(20, 20, 20, 200),
                radius=self.HEIGHT / 2,
            )
            for i, option in enumerate(options):
                PainterUtils.paint_image(
                    context.painter.q_painter(),
                    context.mouse_location
                    + NumberVector(50 * i, 0)
                    + (self.HEIGHT - self.IMAGE_SIZE) / 2,
                    ":/icon_delete.png",
                    self.IMAGE_SIZE,
                    self.IMAGE_SIZE,
                )

    def get_components(self) -> List[Paintable]:
        return super().get_components()
