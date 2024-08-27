from abc import ABCMeta, abstractmethod
from typing import List

from project_graph.camera import Camera
from project_graph.paint.painters import ProjectGraphPainter


class PaintContext:
    """绘制上下文，该类是为了便于在绘制时传递一些额外信息。"""

    def __init__(self, painter: ProjectGraphPainter, camera: Camera):
        """
        Args:
            painter (QPainter): 已经使用QTransform将世界坐标转化为视野渲染坐标的painter
        """
        self.painter = painter
        self.camera = camera


class Paintable(metaclass=ABCMeta):
    """代表了所有能绘制的一个对象"""

    @abstractmethod
    def get_components(self) -> List["Paintable"]:
        """
        获取该对象的基本图元(不可拆分的最小绘制单元)，如没有，返回空列表
        """
        pass

    @abstractmethod
    def paint(self, context: PaintContext) -> None:
        """使用context绘制本对象，

        Args:
            context (PaintContext): 待使用的context
        """
        pass
