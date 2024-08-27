from abc import ABC, abstractmethod

from project_graph.paint.paintables import Paintable, PaintContext


class Effect(Paintable, ABC):
    """
    抽象特效类
    """

    def __init__(self, duration: int):
        self.max_time = duration
        self.current_time = duration

    def tick(self):
        if self.current_time > 0:
            self.current_time -= 1

    def is_done(self):
        """
        判断特效是否完成
        """
        return self.current_time == 0

    @abstractmethod
    def paint(self, context: PaintContext):
        pass

    @property
    def finish_rate(self):
        """
        返回当前特效的完成度，0-1之间
        """
        return 1 - self.current_time / self.max_time
