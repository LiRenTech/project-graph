from PyQt5.QtCore import QThread, pyqtSignal


class AIRequestThreadFast(QThread):
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
            self.finished.emit(nodes)
        except Exception as e:
            self.error.emit(str(e))
