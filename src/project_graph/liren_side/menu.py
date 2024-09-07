from typing import Callable

from PyQt5.QtWidgets import QAction, QMainWindow, QMenu


class LAction:
    def __init__(
        self,
        action: Callable[[], None] = lambda: None,
        shortcut: str = "",
        title: str = "",
        enabled: bool = True,
    ):
        self._text = title
        self.__action = action
        self.__shortcut = shortcut
        self.__enabled = enabled

    def _apply_to_qt(self, action: QAction):
        action.triggered.connect(self.__action)
        action.setEnabled(self.__enabled)
        if self.__shortcut != "":
            action.setShortcut(self.__shortcut)


class LMenu:
    def __init__(self, title: str = "", children: tuple["LMenu | LAction", ...] = ()):
        self.__menus = children
        self._title = title

    def _apply_to_qt(self, native_menu: QMenu) -> QMenu:
        for menu in self.__menus:
            if isinstance(menu, LMenu):
                menu._apply_to_qt(native_menu.addMenu(menu._title))
            else:
                action = QAction(menu._text, native_menu)
                menu._apply_to_qt(action)
                native_menu.addAction(action)
        return native_menu


class LMenuBar:
    def __init__(self, *menus: "LMenu | LAction"):
        self.__menus = menus

    def apply_to_qt_window(self, native_window: QMainWindow) -> None:
        menu_bar = native_window.menuBar()
        assert menu_bar is not None
        menu_bar.clear()
        for menu in self.__menus:
            if isinstance(menu, LMenu):
                menu._apply_to_qt(menu_bar.addMenu(menu._title))
            else:
                action = QAction(menu._text, menu_bar)
                menu._apply_to_qt(action)
                menu_bar.addAction(action)
