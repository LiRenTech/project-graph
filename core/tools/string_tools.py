from PyQt5.QtGui import QFont, QFontMetrics, QPainter


def get_width_by_file_name(file_name: str) -> int:
    """
    根据文件名获取宽度
    :param file_name:
    :return:
    """
    res = 0
    for c in file_name:
        if "\u4e00" <= c <= "\u9fff":
            res += 53.33333333333333
        else:
            res += 33.33333333333333
    return int(res)


def get_size_by_text(font_size: float, text: str) -> tuple[int, int, int]:
    """
    返回文本的宽度、高度和基线
    """
    font = QFont("Times New Roman")
    font.setPointSize(int(font_size))
    font_metrics = QFontMetrics(font)

    # 获取文本的宽度和高度
    text_width = font_metrics.width(text)
    text_height = font_metrics.height()
    ascent = font_metrics.ascent()
    return text_width, text_height, ascent
