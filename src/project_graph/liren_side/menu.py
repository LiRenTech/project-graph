from typing import Callable
from PyQt5.QtWidgets import QMainWindow, QMenuBar, QMenu, QAction


class LAction:
    def __init__(self, text: str, action: Callable[[], None] = lambda: None):
        self.__text = text
        self.__action = action


class LMenu:
    def __init__(self, *menus: "LMenu | LAction", title: str):
        self.__menus = menus
        self.__title = title

    def __to_qt(self, native_menu: QMenu) -> QMenu:
        for menu in self.__menus:
            if isinstance(menu, LMenu):
                menu.__to_qt(native_menu.addMenu(menu.__title))
            else:
                action = QAction(menu.__text, native_menu)
                action.triggered.connect(menu.__action)
                native_menu.addAction(action)
        return native_menu


class LMenuBar:
    def __init__(self, *menus: "LMenu | LAction"):
        self.__menus = menus

    def to_qt_by_window(self, native_window: QMainWindow) -> None:
        menu_bar = native_window.menuBar()
        assert menu_bar is not None
        for menu in self.__menus:
            if isinstance(menu, LMenu):
                menu.__to_qt(menu_bar.addMenu(menu.__title))
            else:
                action = QAction(menu.__text, menu_bar)
                action.triggered.connect(menu.__action)
                menu_bar.addAction(action)
