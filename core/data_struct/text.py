from core.data_struct.number_vector import NumberVector


class Text:
    def __init__(self, left_top: NumberVector, text: str):
        self.left_top = left_top
        self.text = text
