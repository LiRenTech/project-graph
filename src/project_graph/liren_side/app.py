from typing import Callable
from project_graph.liren_side.components import Component
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtGui import QPaintEvent, QKeyEvent

import sys


class _NativeWindow(QMainWindow):
    def __init__(
        self, root: Component, init: Callable[[QMainWindow], None] = lambda _: None
    ):
        super().__init__()
        self.root = root
        init(self)

    def paintEvent(self, a0: QPaintEvent | None):
        assert a0 is not None
        self.root.paintEvent(self, a0)

    def keyPressEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        self.root.keyPressEvent(self, a0)

    def keyReleaseEvent(self, a0: QKeyEvent | None):
        assert a0 is not None
        self.root.keyReleaseEvent(self, a0)


class App:
    def __init__(
        self, root: Component, init: Callable[[QMainWindow], None] = lambda _: None
    ):
        self.__app = QApplication(sys.argv)
        self.__window = _NativeWindow(root, init)

    def run(self):
        self.__window.show()
        sys.exit(self.__app.exec_())
