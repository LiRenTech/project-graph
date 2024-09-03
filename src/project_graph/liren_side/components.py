from abc import ABCMeta, abstractmethod
from project_graph.camera import Camera
from project_graph.data_struct.number_vector import NumberVector
from PyQt5.QtWidgets import QMainWindow
from PyQt5.QtGui import QPaintEvent, QPainter, QColor, QKeyEvent
from PyQt5.QtCore import Qt
from project_graph.paint.paint_elements import paint_grid


class Component(metaclass=ABCMeta):
    @abstractmethod
    def paintEvent(self, window: QMainWindow, event: QPaintEvent) -> None:
        pass

    def keyPressEvent(self, window: QMainWindow, event: QKeyEvent):
        pass

    def keyReleaseEvent(self, window: QMainWindow, event: QKeyEvent):
        pass

    @abstractmethod
    def contains(self, point: NumberVector) -> bool:
        pass


class World(Component):
    def __init__(self):
        self.__camera = Camera(NumberVector.zero(), 1920, 1080)

    def paintEvent(self, window: QMainWindow, event: QPaintEvent):
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

    def keyPressEvent(self, window: QMainWindow, event: QKeyEvent):
        key: int = event.key()
        if key == Qt.Key.Key_A:
            self.__camera.press_move(NumberVector(-1, 0))
        elif key == Qt.Key.Key_S:
            self.__camera.press_move(NumberVector(0, 1))
        elif key == Qt.Key.Key_D:
            self.__camera.press_move(NumberVector(1, 0))
        elif key == Qt.Key.Key_W:
            self.__camera.press_move(NumberVector(0, -1))
        elif key == Qt.Key.Key_BracketLeft:
            # `[` 键来缩小视野
            for _ in range(5):
                self.__camera.zoom_out()
        elif key == Qt.Key.Key_BracketRight:
            # `]` 键来放大视野
            for _ in range(5):
                self.__camera.zoom_in()

    def keyReleaseEvent(self, window: QMainWindow, event: QKeyEvent):
        pass
