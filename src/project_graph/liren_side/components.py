from abc import ABCMeta, abstractmethod
from project_graph.camera import Camera
from project_graph.data_struct.number_vector import NumberVector
from PyQt5.QtWidgets import QMainWindow
from PyQt5.QtGui import QPaintEvent, QPainter, QColor

from project_graph.paint.paint_elements import paint_grid


class Component(metaclass=ABCMeta):
    @abstractmethod
    def paintEvent(self, window: QMainWindow, event: QPaintEvent | None) -> None:
        pass

    @abstractmethod
    def contains(self, point: NumberVector) -> bool:
        pass


class World(Component):
    def __init__(self):
        self.__camera = Camera(NumberVector.zero(), 1920, 1080)

    def paintEvent(self, window: QMainWindow, event: QPaintEvent | None):
        painter = QPainter(window)
        # 获取窗口的尺寸
        rect = window.rect()
        # 更新camera大小，防止放大窗口后缩放中心点还在左上部分
        self.__camera.reset_view_size(rect.width(), rect.height())
        # 使用黑色填充整个窗口
        painter.fillRect(rect, QColor(43, 43, 43, 255))
        # 画网格
        paint_grid(painter, self.__camera)

    def contains(self, point: NumberVector) -> bool:
        return True
