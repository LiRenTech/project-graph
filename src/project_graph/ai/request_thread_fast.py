from PyQt5.QtCore import QThread, pyqtSignal


class AIRequestThreadExpandNode(QThread):
    finished = pyqtSignal(list)
    error = pyqtSignal(str)

    def __init__(self, provider, node_manager, *args):
        super().__init__()
        self.provider = provider
        self.node_manager = node_manager
        self.args = args

    def run(self):
        try:
            nodes: list[str] = self.provider.generate_nodes(
                self.node_manager, *self.args
            )
            print(nodes)

            self.finished.emit(nodes)
        except Exception as e:
            self.error.emit(str(e))


class AIRequestThreadEditNode(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, provider, node_manager, *args):
        super().__init__()
        self.provider = provider
        self.node_manager = node_manager
        self.args = args

    def run(self):
        try:
            content: str = self.provider.generate_nodes(self.node_manager, *self.args)
            print(content)

            self.finished.emit(content)
        except Exception as e:
            self.error.emit(str(e))


class AIRequestThreadSummarizeAll(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, provider, node_manager, *args):
        super().__init__()
        self.provider = provider
        self.node_manager = node_manager
        self.args = args

    def run(self):
        try:
            content: str = self.provider.generate_nodes(self.node_manager, *self.args)
            print(content)

            self.finished.emit(content)
        except Exception as e:
            self.error.emit(str(e))
