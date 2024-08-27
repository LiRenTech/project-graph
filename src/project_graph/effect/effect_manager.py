from project_graph.effect.effect import Effect
from project_graph.paint.paintables import PaintContext


class EffectManager:
    def __init__(self):
        self.effects: list[Effect] = []

    def add_effect(self, effect: Effect):
        self.effects.append(effect)

    def tick(self):
        for effect in self.effects:
            effect.tick()
        # 清理播放完毕的特效
        self.effects = [effect for effect in self.effects if not effect.is_done()]

    def paint(self, context: PaintContext):
        for effect in self.effects:
            effect.paint(context)
