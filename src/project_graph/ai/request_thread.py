from uuid import uuid4

from PyQt5.QtCore import QThread, pyqtSignal


class AIRequestThread(QThread):
    finished = pyqtSignal(list)
    error = pyqtSignal(str)

    def __init__(self, provider, node_manager, *args):
        super().__init__()
        self.provider = provider
        self.node_manager = node_manager
        self.args = args

    def run(self):
        try:
            nodes = self.provider.generate_nodes(self.node_manager, *self.args)
            for dic in nodes:
                dic["body_shape"]["width"] = 100
                dic["body_shape"]["height"] = 100
                dic["details"] = dic["details"].replace("$$$", "\n")
                dic["uuid"] = str(uuid4())
                dic["children"] = []
            self.finished.emit(nodes)
        except Exception as e:
            self.error.emit(str(e))
